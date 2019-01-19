const fs = require('fs');
const csv = require('csvtojson');
const uuid = require('uuid/v4');

csv().fromFile('./data/spreadsheet-export-1546914442784.csv').then(rows => {
    //const rows = rows.slice(0, 20);




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
                console.log(row.Exercise, ex);
            }
        }
    }
    console.log(sets.filter(s => s.anomalous));

})

function noWeightStraightSetStrategy(row) {



    function canHandle(row) {
        return !isNaN(Number(row.Reps))
            && !isNaN(Number(row.Sets))
            && (row.Weight === undefined || row.Weight === null || row.Weight.trim() === "");
    }

    if (canHandle(row)) {
        const sets = [];
        for (let i = 0; i < row.Sets; i++) {
            sets.push(new ActivitySet(row, i + 1, noWeightStraightSetStrategy));
        }
        return sets;
    }

    return false;
}

function straightSetStrategy(row) {

    function canHandle(row) {
        return !isNaN(Number(row.Reps))
            && !isNaN(Number(row.Sets))
            && !isNaN(Number(row.Weight));
    }

    if (canHandle(row)) {
        const sets = [];
        for (let i = 0; i < row.Sets; i++) {
            sets.push(new ActivitySet(row, i + 1, straightSetStrategy));
        }
        return sets;
    }

    return false;
}

function compoundSetStrategy(row) {

    function canHandle(row) {
        return row.Reps.toString().match(/^(\d+)\+(\d+)$/) !== null
            && !isNaN(Number(row.Sets))
            && !isNaN(Number(row.Weight));
    }

    if (canHandle(row)) {
        const sets = [];
        const matches = row.Reps.toString().match(/^(\d+)\+(\d+)$/);
        const reps = Number(matches[1]) + Number(matches[2]);
        for (let i = 0; i < row.Sets; i++) {
            const set = new ActivitySet(row, i + 1, straightSetStrategy);
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
            && !isNaN(Number(row.Sets))
            && !isNaN(Number(row.Reps));
    }

    const weightForSets = parseWeightColumn(row.Weight.toString());
    const validWeightForSets = isWeightForSetsValid(weightForSets, Number(row.Sets));

    if (canHandle(row, validWeightForSets)) {
        const sets = [];
        for (let i = 0; i < weightForSets.length; i++) {
            const set = new ActivitySet(row, i + 1, differentWeightsPerSetStrategy);
            set.weight = weightForSets[i];
            sets.push(set);
        }
        // const matches = row.Reps.toString().match(/^(\d+)\+(\d+)$/);
        // const reps = Number(matches[1]) + Number(matches[2]);
        // for (let i = 0; i < row.Sets; i++) {
        //     const set = new ActivitySet(row, i + 1, straightSetStrategy);
        //     set.reps = reps;
        //     sets.push(set);
        // }
        return sets;
    }

    return false;
}

function catchAllStrategy(row) {
    const set = new ActivitySet(row, undefined, catchAllStrategy);
    set.anomalous = true;
    set.originalData = row;
    return [set];
}

class ActivitySet {
    constructor(row, setNumber, strategyUsed) {
        this.id = uuid();
        this.week = row.Week;
        this.day = row.Day;
        this.exercise = row.Exercise;
        this.setNumber = setNumber;
        this.reps = Number(row.Reps);
        this.instructions = row.Instructions;
        this.weight = Number(row.Weight);
        this.notes = row.Notes;
        this.anomalous = false;
        this.strategyUsed = strategyUsed
    }
}


