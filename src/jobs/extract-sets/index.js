const db = require('../../db');
const extractionChain = require('./extractionChain');

const CLEANED_ROWS_PATH = process.argv[2];

(async function () {
    const cleanedRows = (await db.fileSystem.getCleanedRows(CLEANED_ROWS_PATH))
        // .filter(r =>    r.week === "135" && 
        //                 r.day === "1" &&
        //                 r.exercise === "Leg Press");

    console.log("Blank exercise rows:", cleanedRows.filter(r => r.exercise === ""));

    const sets = extractionChain.extractSets(cleanedRows);

    console.log("Anomalous rows:", sets.filter(s => s.anomalous));

    db.fileSystem.persistExtractedSets(sets);
})();
