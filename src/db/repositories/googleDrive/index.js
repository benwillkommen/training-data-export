const { promisify } = require('util');
const sleep = require('system-sleep');

function getSheetPromises(spreadsheetId, sheetsClient) {
    const getSpreadsheetAsync = promisify(sheetsClient.spreadsheets.get);
    return getSpreadsheetAsync({ spreadsheetId })
        .then(res => {
            const sheetTitles = res.data.sheets.map(s => s.properties.title).slice(1);
            return _getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient);
        });
}

async function getSheets(spreadsheetId, sheetsClient) {
    const sheetPromises = await getSheetPromises(spreadsheetId, sheetsClient);
    return Promise.all(sheetPromises);
}


function _getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient) {
    // uncomment if getting rate limited during dev
    // sheetTitles = sheetTitles.slice(0, 10);

    const getSheetAsync = promisify(sheetsClient.spreadsheets.values.get);

    return sheetTitles.map(sheetTitle => {
        sleep(500);
        console.log(`getting sheet: ${sheetTitle}`)
        return getSheetAsync({
            spreadsheetId: spreadsheetId,
            range: sheetTitle,
        }).then(s => {
            s.data.sheetTitle = sheetTitle;
            return s.data;
        });
    });
}

module.exports = {
    getSheetPromises,
    getSheets,
};
