const ActivitySet = require('../../ActivitySet');
const parseWeightColumn = require('./columnParsers/parseWeightColumn');

module.exports = function repRangeInParenthesisStrategy(row) {
    const repsRegex = /\((\d+)-(\d+)\)/;

    function parseRepRange(repsColumn) {
        const matches = repsColumn.match(repsRegex);
        if (matches && matches.length === 3) {
            return Number(matches[2]);
        }
        return false;
    }

    function canHandle(row, parsedReps, weightByReps) {
        return parsedReps !== false
            && !isNaN(Number(row.sets))
            && weightByReps !== false;
    }

    const parsedReps = parseRepRange(row.reps);
    const weightByReps = parseWeightColumn(row.weight, parsedReps);

    if (canHandle(row, parsedReps, weightByReps)) {
        const sets = [];
        for (let i = 0; i < row.sets; i++) {
            const { weight, reps } = weightByReps.length > i ? weightByReps[i] : weightByReps.slice(-1)[0];
            
            const set = new ActivitySet(row, i + 1, "repRangeInParenthesisStrategy", reps, weight);
            sets.push(set);
        }
        return sets;
    }
    return false;
}
