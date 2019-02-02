const fs = require('fs-extra');
const { promisify } = require('util');
const fsAsync = {
    readFile: promisify(fs.readFile),
    readdir: promisify(fs.readdir)
}
const uuid = require('uuid');
const { google } = require('googleapis');
const { getAuthClientAsync } = require('./authorize')
const { convertArrayToCSV } = require('convert-array-to-csv');
const sheetRepository = require('./sheetRepository');
const { consolidateSheet } = require('./sheetConsolidation')

const SPREADSHEET_ID = process.argv[2] || '1Au638nEKSAa2xl8WucH_XW3tw8urKooXJHr9kmlkf1E';
const { TRAINING_DATA_DIR, COLUMN_HEADERS } = require('./constants');

(async function () {
    //const sheets = await sheetRepository.getSheetsFromFileSystem("C:\\dev\\training-data-export\\data\\sheet-json-responses\\batch-1548518308304");

    // just going to read from file system for now, since repository methods return same results whether
    // reading from google drive or file system
    const credentials = JSON.parse(await fsAsync.readFile('credentials.json'));
    const authClient = await getAuthClientAsync(credentials);
    const sheetsClient = google.sheets({ version: 'v4', auth: authClient });

    const sheetsFromGoogleDrive = await sheetRepository.getSheetsFromGoogleDrive(SPREADSHEET_ID, sheetsClient);
    const { persistedSheets, batchPath } = await sheetRepository.persistSheetsToFileSystem(sheetsFromGoogleDrive);

    // this is unnecessary, as we could have passed in sheetsFromGoogleDrive or persistedSheets
    // just exercising the repository.
    const sheetsFromFileSystem = await sheetRepository.getSheetsFromFileSystem(batchPath);

    const cleanedSheets = cleanSheets(sheetsFromFileSystem);
    const rows = flattenSheets(cleanedSheets);
    const rowsWithAllColumns = ensureAllColumnsExist(rows);
    const rowsWithAssociatedSupersets = associateSuperSets(rowsWithAllColumns);
    const cleanedRows = addHeaders(rowsWithAssociatedSupersets);
    await writeData(cleanedRows);
})();

function cleanSheets(sheets) {
    return sheets.map(consolidateSheet)
}

function flattenSheets(sheets) {
    return sheets.reduce((prev, curr) => prev.concat(curr), [])
}

function ensureAllColumnsExist(rows) {
    return rows.map(r => {
        const fillerArray = [];
        for (let i = 0; i < COLUMN_HEADERS.length - r.length; i++) {
            fillerArray.push("");
        }
        return r.concat(fillerArray);
    });
}

function associateSuperSets(cleanedRows) {

    const superSetIndices = cleanedRows
        .map((row, i) => { return { value: row[2].toLowerCase().trim(), index: i } })
        .filter(rowObj => rowObj.value.includes("superset"))
        .map(rowObj => rowObj.index);

    const groupedSuperSetIndices = superSetIndices.reduce((collection, next) => {
        if (collection.length === 0) {
            return [[next]];
        }

        const lastGroup = collection.slice(-1)[0];
        const lastValue = lastGroup.slice(-1)[0];
        if (next - lastValue > 2) {
            return collection.concat([[next]]);
        }

        return collection.slice(0, -1).concat([lastGroup.concat(next)]);

    }, []);

    const superSetRanges = groupedSuperSetIndices.map(si => {
        return {
            id: uuid(),
            start: si[0] - 1,
            end: si.slice(-1)[0] + 1
        }
    })

    const rowsWithAssociatedSuperSets = cleanedRows.map((row, i) => {
        for (let superSetRange of superSetRanges) {
            if (i >= superSetRange.start && i <= superSetRange.end) {
                return row.slice(0, -1).concat(superSetRange.id);
            }
        }
        return row.slice(0, -1).concat("")
    }).filter((row, i) => !superSetIndices.includes(i));

    return rowsWithAssociatedSuperSets
}

async function writeData(rows) {
    const filePath = `${TRAINING_DATA_DIR}/clean-phase-1/${new Date().getTime()}.csv`;
    await fs.outputFile(filePath, convertArrayToCSV(rows))
}

function addHeaders(rows) {
    rows.unshift(COLUMN_HEADERS)
    return rows;
}