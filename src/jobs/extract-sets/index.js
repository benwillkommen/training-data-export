const fse = require('fs-extra');
const csv = require('csvtojson');
const { convertArrayToCSV } = require('convert-array-to-csv');

const {
    noWeightStraightSetStrategy,
    straightSetStrategy,
    compoundSetStrategy,
    differentWeightsPerSetStrategy,
    differentRepsPerSetsStrategy,
    finalSetDropSetStrategy,
    plusSignDelimitedRepsDropSetStrategy,
    dropSetStrategy,
    failureSpecifiedInRepsColumnAndNoWeightStrategy,
    repRangeInParenthesisStrategy,
    catchAllStrategy
} = require('./strategies');


const TRAINING_DATA_DIR = process.env.TRAINING_DATA_DIR || "./data"

csv().fromFile(`${TRAINING_DATA_DIR}/clean-phase-1/1549070442612.csv`).then(rows => {
    //rows = rows.filter(s => s.reps.includes("failure"));
    //rows = rows.filter(r => (r.week === "139" && r.exercise === "Incline DB Flyes"));
    // rows = rows.filter(r => (r.week === "95" && r.exercise === "Seated Machine Press")
    //                         || (r.week === "116" && r.exercise === "Leg Press"));

    const extractionChain = [
        noWeightStraightSetStrategy,
        straightSetStrategy,
        compoundSetStrategy,
        finalSetDropSetStrategy,
        dropSetStrategy,
        plusSignDelimitedRepsDropSetStrategy,
        differentWeightsPerSetStrategy,
        differentRepsPerSetsStrategy,
        failureSpecifiedInRepsColumnAndNoWeightStrategy,
        //failureSpecifiedInRepsColumnStrategy,
        repRangeInParenthesisStrategy,
        catchAllStrategy
    ];

    let sets = []

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        for (let j = 0; j < extractionChain.length; j++) {
            try {
                const result = extractionChain[j](row);
                if (result !== false) {
                    sets = sets.concat(result);
                    break;
                }
            }
            catch (ex) {
                //console.log(row.exercise, ex);
            }
        }
    }
    console.log(sets.filter(s => s.anomalous));
    const filePath = `${TRAINING_DATA_DIR}/clean-phase-2/${new Date().getTime()}.csv`;
    fse.outputFile(filePath, convertArrayToCSV(sets))

});


