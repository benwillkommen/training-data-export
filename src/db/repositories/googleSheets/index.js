const { promisify } = require('util');
const sleep = require('system-sleep');
const { getGoogleSheetsClient } = require('./auth');
const { GOOGLE_SHEETS_API_SLEEP_MS } = require('../../../constants');

async function getSheetPromises(spreadsheetId) {
    const sheetsClient = await getGoogleSheetsClient();
    const getSpreadsheetAsync = promisify(sheetsClient.spreadsheets.get);
    return getSpreadsheetAsync({ spreadsheetId })
        .then(res => {
            const sheetTitles = res.data.sheets.map(s => s.properties.title).slice(1);
            return _getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient);
        });
}

async function getSheets(spreadsheetId) {
    const sheetsClient = await getGoogleSheetsClient();
    const sheetPromises = await getSheetPromises(spreadsheetId, sheetsClient);
    return Promise.all(sheetPromises);
}


async function _getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient) {
    // uncomment if getting rate limited during dev
    // sheetTitles = sheetTitles.slice(0, 10);

    const getSheetAsync = promisify(sheetsClient.spreadsheets.values.get);

    async function getSheetsWithBackoff(sheetTitlesRemaining, sheetsCollected, sleepTime, retriesRemaining) {
        sleep(sleepTime);
        const sheetTitle = sheetTitlesRemaining[0];
        console.log(`getting sheet: ${sheetTitle}`);
        try {
            const sheet = await getSheetAsync({
                spreadsheetId: spreadsheetId,
                range: sheetTitle,
            });
            sheet.data.sheetTitle = sheetTitle;
            sheetsCollected.push(sheet);
            if (sheetTitlesRemaining.length > 0) {
                getSheetsWithBackoff(sheetTitlesRemaining.slice(1), sheetsCollected, sleepTime, retriesRemaining);
            }
            return sheetsCollected;
        }
        catch (ex) {
            const newRetriesRemaining = retriesRemaining - 1;
            const newSleepTime = sleepTime * 2;
            if (newRetriesRemaining <= 0) {
                console.log("Ran out of retries getting sheets. Rethrowing.")
                throw (ex);
            }
            console.log(`exception getting sheet "${sheetTitle}. sleepTime increased to ${newSleepTime}, retries remaining: ${newRetriesRemaining}"`, ex);
            console.log()
            getSheetsWithBackoff(sheetTitlesRemaining, sheetsCollected, newSleepTime, newRetriesRemaining);
        }
    };

    return getSheetsWithBackoff(sheetTitles, [], GOOGLE_SHEETS_API_SLEEP_MS, 15);
    
}

module.exports = {
    getSheetPromises,
    getSheets,
};
