const { promisify } = require('util');
const sleep = require('system-sleep');
const fse = require('fs-extra');
const { TRAINING_DATA_DIR } = require('./constants');

function getSheetPromises(spreadsheetId, sheetsClient) {
    const getSpreadsheetAsync = promisify(sheetsClient.spreadsheets.get);
    return getSpreadsheetAsync({ spreadsheetId })
        .then(res => {
            const sheetTitles = res.data.sheets.map(s => s.properties.title).slice(1);
            return getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient);
        });
}

function persistSheetPromises(sheetPromises) {
    const downloadBatchDirectoryName = `batch-${new Date().getTime()}`;
    return Promise.all(sheetPromises.map(sp => {
        return sp.then(async s => {
            const filePath = `${TRAINING_DATA_DIR}/sheet-json-responses/${downloadBatchDirectoryName}/${s.data.sheetTitle}.json`;
            await fse.outputFile(filePath, JSON.stringify(s.data, null, 3));
            return s;
        })
    }));
}

function getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient) {
    //sheetTitles = sheetTitles.filter(title => title === "Week 99"); // comment when ready to process them all

    const getSheetAsync = promisify(sheetsClient.spreadsheets.values.get);

    return sheetTitles.map(sheetTitle => {
        sleep(200);
        console.log(`getting sheet: ${sheetTitle}`)
        return getSheetAsync({
            spreadsheetId: spreadsheetId,
            range: sheetTitle,
        }).then(s => {
            s.data.sheetTitle = sheetTitle;
            return s;
        });
    });
}

module.exports = {
    getSheetPromises,
    persistSheetPromises
};
