const ActivitySet = require('../../ActivitySet');
const { parseWeightColumn, parseSetRange } = require('./columnParsers');

module.exports = function setRangeInParenthesisStrategy(row) {
    function canHandle(row, parsedSets, weightByReps) {
        return parsedSets !== false
            && !isNaN(Number(row.reps))
            && weightByReps !== false;
    }

    const parsedSets = parseSetRange(row.sets);
    const weightByReps = parseWeightColumn(row.weight, parsedSets);
    if (canHandle(row, parsedSets, weightByReps)) {

        let numberOfSets = parsedSets.maxSets;
        if(weightByReps.length > parsedSets.maxSets){
            numberOfSets = weightByReps.length;
        } else if (weightByReps.length >= parsedSets.minSets){
            numberOfSets = parsedSets.minSets
        }

        const sets = [];
        for (let i = 0; i < numberOfSets; i++) {
            const { weight, reps } = weightByReps.length > i ? weightByReps[i] : weightByReps.slice(-1)[0];
            const set = new ActivitySet(row, i + 1, "setRangeInParenthesisStrategy", reps, weight);
            sets.push(set);
        }
        return sets;
    }
    return false;
}
