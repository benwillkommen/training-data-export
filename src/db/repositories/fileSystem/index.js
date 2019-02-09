const { promisify } = require('util');
const fs = require('fs-extra');
const fsAsync = {
    readFile: promisify(fs.readFile),
    readdir: promisify(fs.readdir)
}
const { convertArrayToCSV } = require('convert-array-to-csv');

const { TRAINING_DATA_DIR } = require('../../../../constants');
const defaultBatchDirectory = `${TRAINING_DATA_DIR}/sheet-json-responses`

async function persistSheets(sheets, batchDirectory = defaultBatchDirectory) {
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

async function persistSheetPromises(sheetPromises, batchDirectory = defaultBatchDirectory) {
    return persistSheets(await Promise.all(sheetPromises), batchDirectory);
}

async function getSheets(batchPath) {
    const _batchPath = batchPath || `${defaultBatchDirectory}/${_getMostRecent(defaultBatchDirectory)}`;
    const sheetJsonFileNames = await fsAsync.readdir(_batchPath);
    return await Promise.all(sheetJsonFileNames.map(async (fileName) => {
        return JSON.parse(await fsAsync.readFile(`${_batchPath}\\${fileName}`));
    }));
}

async function persistCleanedRows(cleanedRows) {
    const filePath = `${TRAINING_DATA_DIR}/clean-phase-1/${new Date().getTime()}.csv`;
    await fs.outputFile(filePath, convertArrayToCSV(cleanedRows));
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
    persistCleanedRows,
    getSheets
};
