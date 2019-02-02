const { promisify } = require('util');
const sleep = require('system-sleep');
const fs = require('fs-extra');
const fsAsync = {
    readFile: promisify(fs.readFile),
    readdir: promisify(fs.readdir)
}
const { TRAINING_DATA_DIR } = require('./constants');

const defaultBatchDirectory = `${TRAINING_DATA_DIR}/sheet-json-responses`

function getSheetPromisesFromGoogleDrive(spreadsheetId, sheetsClient) {
    const getSpreadsheetAsync = promisify(sheetsClient.spreadsheets.get);
    return getSpreadsheetAsync({ spreadsheetId })
        .then(res => {
            const sheetTitles = res.data.sheets.map(s => s.properties.title).slice(1);
            return _getIndividualSheetsAsync(spreadsheetId, sheetTitles, sheetsClient);
        });
}

async function getSheetsFromGoogleDrive(spreadsheetId, sheetsClient) {
    const sheetPromises = await getSheetPromisesFromGoogleDrive(spreadsheetId, sheetsClient);
    return Promise.all(sheetPromises);
}

async function persistSheetsToFileSystem(sheets, batchDirectory = defaultBatchDirectory) {
    const downloadBatchDirectoryName = `batch-${new Date().getTime()}`;
    const batchPath = `${batchDirectory}/${downloadBatchDirectoryName}`;
    const persistedSheets = await Promise.all(sheets.map(async s => {
        const filePath = `${batchPath}/${s.sheetTitle}.json`;
        await fs.outputFile(filePath, JSON.stringify(s, null, 3));

        return s;
    }));

    return {
        persistedSheets,
        batchPath
    }
}

async function persistSheetPromisesToFileSystem(sheetPromises, batchDirectory = defaultBatchDirectory) {
    return persistSheetsToFileSystem(await Promise.all(sheetPromises), batchDirectory);
}

async function getSheetsFromFileSystem(batchPath) {
    const sheetJsonFileNames = await fsAsync.readdir(batchPath);
    return await Promise.all(sheetJsonFileNames.map(async (fileName) => {
        return JSON.parse(await fsAsync.readFile(`${batchPath}\\${fileName}`));
    }));
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
    getSheetPromisesFromGoogleDrive,
    persistSheetPromisesToFileSystem,
    getSheetsFromGoogleDrive,
    persistSheetsToFileSystem,
    getSheetsFromFileSystem
};
