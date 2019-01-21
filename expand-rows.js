const fse = require('fs-extra');
const csv = require('csvtojson');
const uuid = require('uuid/v4');
const { convertArrayToCSV } = require('convert-array-to-csv');


const TRAINING_DATA_DIR = process.env.TRAINING_DATA_DIR || "./data"

csv().fromFile(`${TRAINING_DATA_DIR}/spreadsheet-export-1547955512514.csv`).then(rows => {
    //rows = rows.slice(0, 5);

    const strategies = [
        noWeightStraightSetStrategy,
        straightSetStrategy,
        compoundSetStrategy,
        differentWeightsPerSetStrategy,
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
                console.log(row.exercise, ex);
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

function catchAllStrategy(row) {
    const set = new ActivitySet(row, undefined, "catchAllStrategy");
    set.anomalous = true;
    set.originalData = row;
    return [set];
}

class ActivitySet {
    constructor(row, setNumber, strategyUsed) {
        this.id = uuid();
        this.week = row.week;
        this.day = row.day;
        this.exercise = row.exercise;
        this.setNumber = setNumber;
        this.reps = Number(row.reps);
        this.instructions = row.instructions;
        this.weight = Number(row.weight);
        this.notes = row.notes;
        this.supersetId = row.supersetId
        this.anomalous = false;
        this.strategyUsed = strategyUsed
    }
}


