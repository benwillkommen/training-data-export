const { promisify } = require('util');
const fs = require('fs-extra');
const fsAsync = {
    readFile: promisify(fs.readFile),
    readdir: promisify(fs.readdir)
}
const { convertArrayToCSV } = require('convert-array-to-csv');
const csv = require('csvtojson');
const moment = require('moment');

const { TRAINING_DATA_DIR } = require('../../../constants');
const defaultSheetDownloadDirectory = `${TRAINING_DATA_DIR}/downloaded-sheets`;
const defaultCleanedRowsDirectory = `${TRAINING_DATA_DIR}/cleaned-rows`;
const defaultRepPRsDirectory = `${TRAINING_DATA_DIR}/rep-prs`;
const defaultExtractedSetsDirectory = `${TRAINING_DATA_DIR}/extracted-sets`;

const nameListCsvPath = `${TRAINING_DATA_DIR}/exercise-synonyms/name-list.csv`;
const canonicalNameListCsvPath = `${TRAINING_DATA_DIR}/exercise-synonyms/canonical-name-list.csv`;

async function persistSheets(sheets, downloadDirectory = defaultSheetDownloadDirectory) {
    const dateString = moment().format('YYYY-MM-DD-THH-mm-ss.SS');
    const downloadBatchDirectoryName = `batch-${dateString}`;
    const batchPath = `${downloadDirectory}/${downloadBatchDirectoryName}`;
    const persistedSheets = await Promise.all(sheets.map(async s => {
        // replace slashes (used for dates) in title with filename safe characters
        const fileName = s.data.sheetTitle.replace(/\//g, '-');
        const filePath = `${batchPath}/${fileName}.json`;
        await fs.outputFile(filePath, JSON.stringify(s.data, null, 3));

        return s.data;
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
    const dateString = moment().format('YYYY-MM-DD-THH-mm-ss.SS');
    const filePath = `${defaultCleanedRowsDirectory}/${dateString}.csv`;
    await fs.outputFile(filePath, convertArrayToCSV(cleanedRows));
    return filePath;
}

async function getCleanedRows(cleanedRowsPath) {
    const _cleanedRowsPath = cleanedRowsPath || `${defaultCleanedRowsDirectory}/${_getMostRecent(defaultCleanedRowsDirectory)}`;
    return await csv().fromFile(_cleanedRowsPath);
}

async function getExerciseNameList() {
    return csv().fromFile(nameListCsvPath);
}

async function getExerciseNameLookup() {
    return (await getExerciseNameList()).reduce((dict, next) => {
        const name = next.name.toLowerCase();
        const canonicalName = next.canonicalName === "" ? name : next.canonicalName.toLowerCase();

        dict[name] = canonicalName;
        return dict;
    }, {});;
}

async function getCanonicalNameLookup() {
    return (await csv().fromFile(canonicalNameListCsvPath)).reduce((dict, next) => {
        if(typeof dict[next.canonicalName] !== 'undefined'){
            throw new Error(`Duplicate canonical name found in name list. Check ${canonicalNameListCsvPath} for duplicates`);
        }

        dict[next.canonicalName] = new Set(next.names.split(',').filter(n => n !== ''));
        return dict;
    }, {});
}

async function persistExerciseNameLookup(list) {
    await fs.outputFile(nameListCsvPath, convertArrayToCSV(list));
    return nameListCsvPath;
}

async function persistCanonicalNameLookup(canonicalNameLookup) {
    const formattedLookup = Object.keys(canonicalNameLookup).map(key => {
        return {
            canonicalName: key,
            names: Array.from(canonicalNameLookup[key]).reduce((commaDelimitedString, next) => `${next},${commaDelimitedString}`, '')
        }
    });

    await fs.outputFile(canonicalNameListCsvPath, convertArrayToCSV(formattedLookup));
    return canonicalNameListCsvPath;
}

async function persistExtractedSets(extractedSets, exceptions) {
    const dateString = moment().format('YYYY-MM-DD-THH-mm-ss.SS');
    const directory = `${defaultExtractedSetsDirectory}/${dateString}`;

    const anomalousSets = extractedSets.filter(s => s.anomalous);

    await fs.outputFile(`${directory}/sets.csv`, convertArrayToCSV(extractedSets));
    await fs.outputFile(`${directory}/anomalies.json`, JSON.stringify([{ anomalyCount: anomalousSets.length }, anomalousSets], null, 3));
    if (exceptions) {
        await fs.outputFile(`${directory}/exceptions.json`, JSON.stringify([{ exceptionCount: exceptions.length }, exceptions], null, 3));
    }

    return directory;

}

async function persistRepPRs(repPRs) {
    const dateString = moment().format('YYYY-MM-DD-THH-mm-ss.SS');
    const directory = `${defaultRepPRsDirectory}/${dateString}/rep-prs.json`;

    await fs.outputFile(directory, JSON.stringify(repPRs, null, 3));

    return directory;

}

async function getExtractedSets(extractedSetsCsvPath) {
    const _csvPath = extractedSetsCsvPath || `${defaultExtractedSetsDirectory}/${_getMostRecent(defaultExtractedSetsDirectory)}/sets.csv`;
    return await csv().fromFile(_csvPath);
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
    persistExtractedSets,
    getExerciseNameList,
    getExerciseNameLookup,
    getCanonicalNameLookup,
    persistExerciseNameLookup,
    persistCanonicalNameLookup,
    getExtractedSets,
    persistRepPRs
};
