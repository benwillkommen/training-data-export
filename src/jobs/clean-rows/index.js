const db = require('../../db');
const {
    ensureAllColumnsExist,
    cleanSheets,
    flattenSheets,
    associateSuperSets,
    fillInBlankExerciseNames,
    addHeaders } = require('./util');

const BATCH_PATH = process.argv[2];

(async function () {
    const sheetsFromFileSystem = await db.fileSystem.getSheets(BATCH_PATH);
    
    const cleanedSheets = cleanSheets(sheetsFromFileSystem);
    const rows = flattenSheets(cleanedSheets);
    const rowsWithAllColumns = ensureAllColumnsExist(rows);
    const rowsWithAssociatedSupersets = associateSuperSets(rowsWithAllColumns);
    const rowsWithBlankExercisesFilledIn = fillInBlankExerciseNames(rowsWithAssociatedSupersets)
    const cleanedRows = addHeaders(rowsWithBlankExercisesFilledIn);

    const filePath = await db.fileSystem.persistCleanedRows(cleanedRows);
    console.log(`Cleaned rows saved to ${filePath}`);
    
})();