const { promisify } = require('util');
const fs = require('fs-extra');
const fsAsync = {
    readFile: promisify(fs.readFile),
    readdir: promisify(fs.readdir)
}
const { convertArrayToCSV } = require('convert-array-to-csv');
const csv = require('csvtojson');

const { TRAINING_DATA_DIR } = require('../../../constants');
const defaultSheetDownloadDirectory = `${TRAINING_DATA_DIR}/downloaded-sheets`;
const defaultCleanedRowsDirectory = `${TRAINING_DATA_DIR}/cleaned-rows`;
const defaultExtractedSetsDirectory = `${TRAINING_DATA_DIR}/extracted-sets`;

async function persistSheets(sheets, downloadDirectory = defaultSheetDownloadDirectory) {
    const downloadBatchDirectoryName = `batch-${new Date().getTime()}`;
    const batchPath = `${downloadDirectory}/${downloadBatchDirectoryName}`;
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

async function persistSheetPromises(sheetPromises, downloadDirectory = defaultSheetDownloadDirectory) {
    return persistSheets(await Promise.all(sheetPromises), downloadDirectory);
}

async function getSheets(batchPath) {
    const _batchPath = batchPath || `${defaultSheetDownloadDirectory}/${_getMostRecent(defaultSheetDownloadDirectory)}`;
    const sheetJsonFileNames = await fsAsync.readdir(_batchPath);
    return await Promise.all(sheetJsonFileNames.map(async (fileName) => {
        return JSON.parse(await fsAsync.readFile(`${_batchPath}/${fileName}`));
    }));
}

async function persistCleanedRows(cleanedRows) {
    const filePath = `${defaultCleanedRowsDirectory}/${new Date().getTime()}.csv`;
    await fs.outputFile(filePath, convertArrayToCSV(cleanedRows));
}

async function getCleanedRows(cleanedRowsPath) {
    const _cleanedRowsPath = cleanedRowsPath || `${defaultCleanedRowsDirectory}/${_getMostRecent(defaultCleanedRowsDirectory)}`;
    return await csv().fromFile(_cleanedRowsPath);
}

async function persistExtractedSets(extractedSets) {
    const filePath = `${defaultExtractedSetsDirectory}/${new Date().getTime()}.csv`;
    await fs.outputFile(filePath, convertArrayToCSV(extractedSets))
}

// Return only base file name without dir
function _getMostRecent(dir) {
    var fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

    var files = fs.readdirSync(dir);

    // use underscore for max()
    return _.max(files, function (f) {
        var fullpath = path.join(dir, f);

        // ctime = creation time is used
        // replace with mtime for modification time
        return fs.statSync(fullpath).ctime;
    });
}

module.exports = {
    persistSheetPromises,
    persistSheets,    
    getSheets,
    persistCleanedRows,
    getCleanedRows,
    persistExtractedSets
};
