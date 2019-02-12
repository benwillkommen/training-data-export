const ActivitySet = require('../../ActivitySet');
const uuid = require('uuid');

module.exports = function partialRepsStrategy(row) {
    // strategy for partials e.g. exercise:"Reverse Fly Machine" instructions:"10 full reps then 10 partials" reps:"10, 10" sets:"3" week:"102" weight:"120"
    function parseRepsColumn(repsColumn) {
        const reps = repsColumn.split(",");
        if (reps.every(x => !isNaN(Number(x)))) {
            return reps.map(x => Number(x));
        }
        return false;
    }
    function parseWeightColumn(weightColumn) {
        const weights = weightColumn.split(",");
        if (weights.every(x => !isNaN(Number(x)))) {
            return weights.map(x => Number(x));
        }
        return false;
    }
    function alignWeightsWithReps(weights, reps) {
        if (weights.length === reps.length) {
            return weights;
        }
        if (weights.length < reps.length) {
            const newWeights = weights.slice();
            while (newWeights.length < reps.length) {
                newWeights.push(newWeights.slice(-1)[0]);
            }
            return newWeights;
        }
        throw new Error("weights.length > reps.length.");
    }
    function canHandle(row, parsedWeights, parsedReps) {
        return row.instructions.toString().toLowerCase().trim().includes("partial")
            && parsedReps
            && parsedWeights
            && parsedReps.length === parsedWeights.length
            && parsedReps.length === 2;
    }

    // this "if" is done out of laziness to prevent an exception from being thrown all the time
    if (!row.instructions.toString().toLowerCase().trim().includes("partial")) {
        return false;
    }

    const parsedReps = parseRepsColumn(row.reps.toString());
    const parsedWeights = alignWeightsWithReps(parseWeightColumn(row.weight.toString()), parsedReps);
    if (canHandle(row, parsedWeights, parsedReps)) {
        const sets = [];
        const supersetId = uuid();
        for (let i = 0; i < Number(row.sets); i++) {
            const set = new ActivitySet(row, i + 1, "partialRepsStrategy", parsedReps[0], parsedWeights[0]);
            set.supersetId = supersetId;
            const partialSet = new ActivitySet(row, i + 1, "partialRepsStrategy", parsedReps[1], parsedWeights[1]);
            partialSet.supersetId = supersetId;
            partialSet.exercise = `Partial ${set.exercise}`;
            sets.push(set, partialSet);
        }
        return sets;
    }
    return false;
}



// TODO: strategy for partials - exercise:"Reverse Fly Machine" instructions:"10 full reps then 10 partials" reps:"10, 10" sets:"3" week:"102" weight:"120"
// TODO: failure or max with weight strategy, use parseWeightColumn function from differentWeightsPerSetStrategy - Week 105 Flat DB Flyes	4	failure		40x10,40x10,40x10,40x10