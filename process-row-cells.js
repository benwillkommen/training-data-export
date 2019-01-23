const fse = require('fs-extra');
const csv = require('csvtojson');
const uuid = require('uuid/v4');
const { convertArrayToCSV } = require('convert-array-to-csv');


const TRAINING_DATA_DIR = process.env.TRAINING_DATA_DIR || "./data"

csv().fromFile(`${TRAINING_DATA_DIR}/clean-phase-1/1548211486743.csv`).then(rows => {
    //rows = rows.filter(s => s.reps.includes("failure"));
    //rows = rows.filter(r => (r.week === "139" && r.exercise === "Incline DB Flyes"));
    // rows = rows.filter(r => (r.week === "95" && r.exercise === "Seated Machine Press")
    //                         || (r.week === "116" && r.exercise === "Leg Press"));

    const strategies = [
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
        catchAllStrategy];

    let sets = []

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        for (let j = 0; j < strategies.length; j++) {
            try {
                const result = strategies[j](row);
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

})

function noWeightStraightSetStrategy(row) {

    function canHandle(row) {
        return !isNaN(Number(row.reps))
            && !isNaN(Number(row.sets))
            && (row.weight === undefined || row.weight === null || row.weight.trim() === "");
    }

    if (canHandle(row)) {
        const sets = [];
        for (let i = 0; i < row.sets; i++) {
            sets.push(new ActivitySet(row, i + 1, "noWeightStraightSetStrategy"));
        }
        return sets;
    }

    return false;
}

function straightSetStrategy(row) {

    function canHandle(row) {
        return !isNaN(Number(row.reps))
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.weight));
    }

    if (canHandle(row)) {
        const sets = [];
        for (let i = 0; i < row.sets; i++) {
            sets.push(new ActivitySet(row, i + 1, "straightSetStrategy"));
        }
        return sets;
    }

    return false;
}

function compoundSetStrategy(row) {

    function canHandle(row) {
        return row.reps.toString().match(/^(\d+)\+(\d+)$/) !== null
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.weight));
    }

    if (canHandle(row)) {
        const sets = [];
        const matches = row.reps.toString().match(/^(\d+)\+(\d+)$/);
        const reps = Number(matches[1]) + Number(matches[2]);
        for (let i = 0; i < row.sets; i++) {
            const set = new ActivitySet(row, i + 1, "compoundSetStrategy");
            set.reps = reps;
            sets.push(set);
        }
        return sets;
    }

    return false;
}

function differentWeightsPerSetStrategy(row) {

    function parseWeightColumn(weightColumn) {
        const tokens = weightColumn.split(",");
        const weightsForSets = tokens
            .map(token => token.trim().split("x").map(t => Number(t)))
            .map(pair => pair.length === 1 ? pair.concat(1) : pair)
            .reduce((collection, nextPair) => {
                const sets = [];
                for (let i = 0; i < nextPair[1]; i++) {
                    sets.push(nextPair[0])
                }
                return collection.concat(sets);
            }, []);
        return weightsForSets;
    }

    function isWeightForSetsValid(weightForSets, sets) {
        return sets === weightForSets.length;
    }

    function canHandle(row, validWeightForSets) {

        return validWeightForSets
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.reps));
    }

    const weightForSets = parseWeightColumn(row.weight.toString());
    const validWeightForSets = isWeightForSetsValid(weightForSets, Number(row.sets));

    if (canHandle(row, validWeightForSets)) {
        const sets = [];
        for (let i = 0; i < weightForSets.length; i++) {
            const set = new ActivitySet(row, i + 1, "differentWeightsPerSetStrategy");
            set.weight = weightForSets[i];
            sets.push(set);
        }
        return sets;
    }

    return false;
}

function differentRepsPerSetsStrategy(row) {

    function canHandle(row, validRepsForSets) {
        return validRepsForSets
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.weight));
    }

    function parseRepsColumn(repsColumn) {
        const tokens = repsColumn.split(",");
        const repsForSets = tokens
            .map(token => token.trim().split("x").map(t => Number(t)))
            .map(pair => pair.length === 1 ? pair.concat(1) : pair)
            .reduce((collection, nextPair) => {
                const sets = [];
                for (let i = 0; i < nextPair[1]; i++) {
                    sets.push(nextPair[0])
                }
                return collection.concat(sets);
            }, []);
        return repsForSets;
    }

    function areRepsValidForSets(repsForSets, sets) {
        return sets === repsForSets.length;
    }

    const repsForSets = parseRepsColumn(row.reps.toString());
    const validRepsForSets = areRepsValidForSets(repsForSets, Number(row.sets));

    if (canHandle(row, validRepsForSets)) {
        return repsForSets.map((r, i) => {
            const set = new ActivitySet(row, i + 1, "differentRepsPerSetsStrategy")
            set.reps = r;
            return set;
        });

    }
    return false;
}

function catchAllStrategy(row) {
    const set = new ActivitySet(row, undefined, "catchAllStrategy");
    set.anomalous = true;
    set.originalData = row;
    return [set];
}

function finalSetDropSetStrategy(row) {
    function isFinalDropDownSet(instructions) {
        const i = instructions.toLowerCase();
        if (i.match(/drop\s?(down|set)/) && i.match(/final set|last set/)) {
            return true;
        }
        return false;
    }

    function parseDropSetWeight(weightColumn) {
        const tokens = weightColumn.split(",");
        if (tokens.every(t => !isNaN(Number(t)))) {
            return tokens.map(t => Number(t));
        }
        return false;
    }

    // function parseDropSetWeight(weightColumn) {
    //     const tokens = weightColumn.split(",");
    //     const repsForWeights = tokens
    //         .map(token => token.trim().split("x").map(t => Number(t)))
    //         .map()
    //     if (tokens.every(t => !isNaN(Number(t)))) {
    //         return tokens.map(t => Number(t));
    //     }
    //     return false;
    // }


    // function parseRepsColumn(repsColumn) {
    //     const tokens = repsColumn.split(",");
    //     const repsForSets = tokens
    //         .map(token => token.trim().split("x").map(t => Number(t)))
    //         .map(pair => pair.length === 1 ? pair.concat(1) : pair)
    //         .reduce((collection, nextPair) => {
    //             const sets = [];
    //             for (let i = 0; i < nextPair[1]; i++) {
    //                 sets.push(nextPair[0])
    //             }
    //             return collection.concat(sets);
    //         }, []);
    //     return repsForSets;
    // }

    function canHandle(row, parsedWeights) {
        return isFinalDropDownSet(row.instructions)
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.reps))
            && parsedWeights !== false;
    }

    const parsedWeights = parseDropSetWeight(row.weight.toString());

    if (canHandle(row, parsedWeights)) {
        return parsedWeights.reduce((agg, nextWeight, i) => {
            if (i === 0) {
                return agg.concat(
                    [...Array(Number(row.sets))]
                        .map((el, i) => new ActivitySet(row, i + 1, "finalSetDropSetStrategy", null, Number(nextWeight), i + 1 === Number(row.sets) ? uuid() : null))
                )
            }
            return agg.concat(new ActivitySet(row, agg.slice(-1)[0].setNumber + 1, "finalSetDropSetStrategy", null, Number(nextWeight), agg.slice(-1)[0].dropSetId))
        }, []);
    }

    return false;
}

///	Incline DB Flyes	3	10+6	10 reps then drop down 6 more	45, 35																				
function plusSignDelimitedRepsDropSetStrategy(row) {
    function parseDropSetWeight(weightColumn) {
        const tokens = weightColumn.split(",");
        if (tokens.every(t => !isNaN(Number(t)))) {
            return tokens.map(t => Number(t));
        }
        return false;
    }

    function parseDropSetReps(repsColumn) {
        const tokens = repsColumn.split("+");
        if (tokens.length < 2) {
            // let's only handle "+"" delimited reps with this strategy
            return false;
        }
        if (tokens.every(t => !isNaN(Number(t)))) {
            return tokens.map(t => Number(t));
        }
        return false;
    }

    function isDropDownSet(instructions) {
        const i = instructions.toLowerCase();
        if (i.match(/drop\s?(down|set)/)) {
            return true;
        }
        return false;
    }

    function canHandle(row, parsedWeights, parsedReps) {
        return isDropDownSet(row.instructions)
            && !isNaN(Number(row.sets))
            && parsedReps !== false
            && parsedWeights !== false
            && parsedReps.length === parsedWeights.length;
    }

    const parsedWeights = parseDropSetWeight(row.weight.toString());
    const parsedReps = parseDropSetReps(row.reps.toString());

    if (canHandle(row, parsedWeights, parsedReps)) {
        const dropsetId = uuid();
        const sets = [];
        let setNumber = 1;

        for (let i = 0; i < Number(row.sets); i++) {
            for (let j = 0; j < parsedWeights.length; j++) {
                sets.push(new ActivitySet(row, setNumber, "plusSignDelimitedRepsDropSetStrategy", parsedReps[j], parsedWeights[j], dropsetId));
                setNumber += 1;
            }
        }
        return sets;
    }
    return false;

}


function dropSetStrategy(row) {

    function isDropDownSet(instructions) {
        const i = instructions.toLowerCase();
        if (i.match(/drop\s?(down|set)/)) {
            return true;
        }
        return false;
    }

    function parseDropSetWeight(weightColumn) {
        const tokens = weightColumn.split(",");
        if (tokens.every(t => !isNaN(Number(t)))) {
            return tokens.map(t => Number(t));
        }
        return false;
    }

    function canHandle(row, parsedWeights) {
        return isDropDownSet(row.instructions)
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.reps))
            && parsedWeights !== false;
    }

    const parsedWeights = parseDropSetWeight(row.weight.toString());

    if (canHandle(row, parsedWeights)) {
        const dropsetId = uuid();
        const sets = [];
        let setNumber = 1;

        for (let i = 0; i < Number(row.sets); i++) {
            for (let j = 0; j < parsedWeights.length; j++) {
                sets.push(new ActivitySet(row, setNumber, "dropSetStrategy", null, parsedWeights[j], dropsetId));
                setNumber += 1;
            }
        }
        return sets;
    }

    return false;
}

function failureSpecifiedInRepsColumnAndNoWeightStrategy(row) {

    function splitCommaSeparatedReps(cell) {
        const reps = cell.split(',');
        if (reps.every(x => !isNaN(Number(x)))) {
            return reps.map(x => Number(x));
        }
        return false;
    }

    function canHandle(row) {
        return row.reps.toString().toLowerCase().trim().match(/^failure$|^max$/)
            && !isNaN(Number(row.sets))
            && splitCommaSeparatedReps(row.weight.toString().trim()) !== false;
    }

    if (canHandle(row)) {
        const repsForEachSet = splitCommaSeparatedReps(row.weight.toString().trim());
        return repsForEachSet.map((r, i) => {
            const rowCopy = JSON.parse(JSON.stringify(row));
            rowCopy.reps = r;
            rowCopy.weight = "";
            return new ActivitySet(rowCopy, i + 1, "bodyweightUntilFailureStrategy");
        });
    }

    return false;
}

function repRangeInParenthesisStrategy(row) {
    // TODO
    return false;
}

class ActivitySet {
    constructor(row, setNumber, strategyUsed, reps, weight, dropSetId) {
        this.id = uuid();
        this.week = row.week;
        this.day = row.day;
        this.exercise = row.exercise;
        this.setNumber = setNumber;
        this.reps = Number(reps) || Number(row.reps);
        this.instructions = row.instructions;
        this.weight = Number(weight) || Number(row.weight);
        this.notes = row.notes;
        this.supersetId = row.supersetId
        this.anomalous = false;
        this.strategyUsed = strategyUsed,
            this.dropSetId = dropSetId
    }
}


