const { promisify } = require('util');
const sleep = require('system-sleep');
const { getGoogleSheetsClient } = require('./auth');
const { GOOGLE_SHEETS_API_SLEEP_MS } = require('../../../constants');

async function getSheets(spreadsheetId) {
    const sheetsClient = await getGoogleSheetsClient();
    const getSpreadsheetAsync = promisify(sheetsClient.spreadsheets.get);
    const spreadSheet = await getSpreadsheetAsync({ spreadsheetId });
    const sheetTitles = spreadSheet.data.sheets.map(s => s.properties.title);

    const sheets = await getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient)
    return sheets;
}

async function getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient) {
    // uncomment if getting rate limited during dev
    //sheetTitles = sheetTitles.slice(8, 13);
    const getSheetAsync = promisify(sheetsClient.spreadsheets.values.get);

    const backoffParams = {
        sleepTime: GOOGLE_SHEETS_API_SLEEP_MS,
        retriesRemaining: 10,
        consecutiveSuccesses: 0,
        consecutiveFailures: 0
    }

    async function getSheetsWithBackoff(sheetTitlesRemaining, sheetsCollected, {
        sleepTime = GOOGLE_SHEETS_API_SLEEP_MS,
        retriesRemaining = 10,
        consecutiveFailures = 0,
        consecutiveSuccesses = 0
    }) {
    
        sleep(sleepTime);
        if (sheetTitlesRemaining.length === 0) {
            return sheetsCollected;
        }
    
        const sheetTitle = sheetTitlesRemaining[0];
        console.log(`getting sheet: ${sheetTitle}`);
    
        try {
            const sheet = await getSheetAsync({
                spreadsheetId: spreadsheetId,
                range: sheetTitle,
            });
            sheet.data.sheetTitle = sheetTitle;
            sheetsCollected.push(sheet);
    
            const nextBackoffParams = getNextBackoffParams(true, sleepTime, retriesRemaining, consecutiveSuccesses, consecutiveFailures);
    
            return await getSheetsWithBackoff(sheetTitlesRemaining.slice(1), sheetsCollected, nextBackoffParams);
        }
        catch (ex) {
            const nextBackoffParams = getNextBackoffParams(false, sleepTime, retriesRemaining, consecutiveSuccesses, consecutiveFailures);
    
            if (nextBackoffParams.retriesRemaining <= 0) {
                console.log("Ran out of retries getting sheets. Rethrowing.")
                throw (ex);
            }
            console.log(`exception getting sheet "${sheetTitle}. sleepTime increased to ${sleepTime}, retries remaining: ${retriesRemaining}"`, ex);
            return await getSheetsWithBackoff(sheetTitlesRemaining, sheetsCollected, nextBackoffParams);
        }
    };

    return await getSheetsWithBackoff(sheetTitles, [], backoffParams);

}



function getNextBackoffParams(wasSuccessful, sleepTime, retriesRemaining, consecutiveSuccesses, consecutiveFailures) {
    if (wasSuccessful) {
        let nextSleepTime = sleepTime;
        if (consecutiveSuccesses > 3 && sleepTime > GOOGLE_SHEETS_API_SLEEP_MS) {
            nextSleepTime = Math.max(GOOGLE_SHEETS_API_SLEEP_MS, sleepTime / 2);
            console.log(`${consecutiveSuccesses} successful calls in a row. Reducing sleepTime from ${sleepTime} to ${nextSleepTime}`);
        }
        return {
            sleepTime: nextSleepTime,
            consecutiveFailures: 0,
            consecutiveSuccesses: consecutiveSuccesses + 1,
            retriesRemaining
        };
    }

    return {
        sleepTime: sleepTime * 2,
        consecutiveFailures: consecutiveFailures + 1,
        consecutiveSuccesses: 0,
        retriesRemaining: retriesRemaining - 1
    };
}

module.exports = {
    getSheets
};
