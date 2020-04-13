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

const BATCH_PATH = process.argv[2] || './data/downloaded-sheets/batch-2020-04-12-T20-02-46.64';

(async function () {
    const sheetsFromFileSystem = await db.fileSystem.getSheets(BATCH_PATH);
    
    const cleanedSheets = cleanSheets(sheetsFromFileSystem);
    const rows = flattenSheets(cleanedSheets);
    const rowsWithAllColumns = ensureAllColumnsExist(rows);
    const rowsWithCanonicalNames = await addCanonicalNameColumn(rowsWithAllColumns);
    const rowsWithAssociatedSupersets = associateSuperSets(rowsWithCanonicalNames);
    const rowsWithBlankExercisesFilledIn = fillInBlankExerciseNames(rowsWithAssociatedSupersets)
    const cleanedRows = addHeaders(rowsWithBlankExercisesFilledIn);

    const filePath = await db.fileSystem.persistCleanedRows(cleanedRows);
    console.log(`Cleaned rows saved to ${filePath}`);
    
})();