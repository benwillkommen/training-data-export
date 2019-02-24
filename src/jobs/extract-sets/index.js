const db = require('../../db');
const extractionChain = require('./extractionChain');

const CLEANED_ROWS_PATH = process.argv[2];

(async function () {
    const cleanedRows = (await db.fileSystem.getCleanedRows(CLEANED_ROWS_PATH))
        // .filter(r =>    r.week === "145" && 
        //                 r.day === "1" &&
        //                 r.exercise === "Front Squats");
        // .filter(r =>    r.week === "139" && 
        //                 r.day === "1" &&
        //                 r.exercise === "Leg Extensions");
        // .filter(r =>    r.week === "140" && 
        //                 r.day === "1" &&
        //                 r.exercise === "Leg Press");
        // .filter(r =>    r.week === "145" && 
        //                 r.day === "2" &&
        //                 r.exercise === "Flat DB Bench Press");

    const sets = extractionChain.extractSets(cleanedRows);

    console.log("Anomalous rows:", sets.filter(s => s.anomalous));

    db.fileSystem.persistExtractedSets(sets);
})();
