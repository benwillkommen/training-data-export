const db = require('../../db');
const extractionChain = require('./extractionChain');

const CLEANED_ROWS_PATH = process.argv[2];

(async function () {
    const cleanedRows = (await db.fileSystem.getCleanedRows(CLEANED_ROWS_PATH))
        .filter(r =>    r.week === "100" && 
                        r.day === "4" &&
                        r.exercise === "Seated Incline DB Curl");



    const sets = extractionChain.extractSets(cleanedRows);

    console.log("Anomalous rows:", sets.filter(s => s.anomalous));

    db.fileSystem.persistExtractedSets(sets);
})();
