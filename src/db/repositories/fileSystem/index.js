const { promisify } = require('util');
const fs = require('fs-extra');
const fsAsync = {
    readFile: promisify(fs.readFile),
    readdir: promisify(fs.readdir)
}
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
    const sheetJsonFileNames = await fsAsync.readdir(batchPath);
    return await Promise.all(sheetJsonFileNames.map(async (fileName) => {
        return JSON.parse(await fsAsync.readFile(`${batchPath}\\${fileName}`));
    }));
}

module.exports = {
    persistSheetPromises,
    persistSheets,
    getSheets
};
