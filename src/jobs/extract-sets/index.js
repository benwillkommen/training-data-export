const db = require('../../db');
const extractionChain = require('./extractionChain');

const CLEANED_ROWS_PATH = process.argv[2] || './data/cleaned-rows/2020-04-12-T20-04-15.94.csv';

(async function () {
    const cleanedRows = (await db.fileSystem.getCleanedRows(CLEANED_ROWS_PATH))
        // .filter(r =>    r.week === "166" && 
        //                 r.day === "1" &&
        //                 r.canonicalName === "leg press");
        //  .filter(r =>   r.week === "198" && 
        //                 r.day === "2" &&
        //                 r.canonicalName === "incline barbell bench press");
        // .filter(r =>    r.week === "162");


    const { sets, exceptions } = extractionChain.extractSets(cleanedRows);

    console.log("Anomalous rows:", sets.filter(s => s.anomalous));

    const directory = await db.fileSystem.persistExtractedSets(sets, exceptions);

    console.log(`Sets written to ${directory}`);
})();
