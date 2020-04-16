const inferDates = require("./util/inferDates");

const db = require('../../db');
const {
    ensureAllColumnsExist,
    cleanSheets,
    flattenSheets,
    associateSuperSets,
    fillInBlankExerciseNames,
    addHeaders,
    addCanonicalNameColumn
 } = require('./util');

const BATCH_PATH = process.argv[2] || './data/downloaded-sheets/batch-2020-04-14-T20-02-46.58';

(async function () {
    const sheetsFromFileSystem = await db.fileSystem.getSheets(BATCH_PATH);
    
    const cleanedSheets = cleanSheets(sheetsFromFileSystem);
    const rows = flattenSheets(cleanedSheets);
    const rowsWithAllColumns = ensureAllColumnsExist(rows);
    const rowsWithCanonicalNames = await addCanonicalNameColumn(rowsWithAllColumns);
    const rowsWithAssociatedSupersets = associateSuperSets(rowsWithCanonicalNames);
    const rowsWithBlankExercisesFilledIn = fillInBlankExerciseNames(rowsWithAssociatedSupersets)
    const rowsWithInferredDates = inferDates(rowsWithBlankExercisesFilledIn);
    const cleanedRows = addHeaders(rowsWithInferredDates);

    const filePath = await db.fileSystem.persistCleanedRows(cleanedRows);
    console.log(`Cleaned rows saved to ${filePath}`);
    
})();



