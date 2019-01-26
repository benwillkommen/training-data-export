const { promisify } = require('util');
const sleep = require('system-sleep');
const fs = require('fs-extra');
const { TRAINING_DATA_DIR } = require('./constants');

function getSheetPromisesFromGoogleDrive(spreadsheetId, sheetsClient) {
    const getSpreadsheetAsync = promisify(sheetsClient.spreadsheets.get);
    return getSpreadsheetAsync({ spreadsheetId })
        .then(res => {
            const sheetTitles = res.data.sheets.map(s => s.properties.title).slice(1);
            return getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient);
        });
}

async function getSheetsFromGoogleDrive(spreadsheetId, sheetsClient) {
    const sheetPromises = await getSheetPromisesFromGoogleDrive(spreadsheetId, sheetsClient);
    return Promise.all(sheetPromises);
}

async function persistSheetsToFileSystem(sheets) {
    const downloadBatchDirectoryName = `batch-${new Date().getTime()}`;
    const sheetDirectory = `${TRAINING_DATA_DIR}/sheet-json-responses/${downloadBatchDirectoryName}`;
    const persistedSheets = await Promise.all(sheets.map(async s => {
        const filePath = `${sheetDirectory}/${s.sheetTitle}.json`;
        await fs.outputFile(filePath, JSON.stringify(s, null, 3));

        return s;
    }));

    return {
        persistedSheets,
        sheetDirectory
    }
}

async function persistSheetPromisesToFileSystem(sheetPromises) {
    return persistSheetsToFileSystem(await Promise.all(sheetPromises));
}

function getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient) {
    // uncomment if getting rate limited during dev
    sheetTitles = sheetTitles.slice(0, 10);

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
    getSheetPromisesFromGoogleDrive,
    persistSheetPromisesToFileSystem,
    getSheetsFromGoogleDrive,
    persistSheetsToFileSystem
};
