const ActivitySet = require('../../ActivitySet');

module.exports = function repRangeInParenthesisStrategy(row) {
    const repsRegex = /\((\d+)-(\d+)\)/;

    function parseRepRange(repsColumn) {
        const matches = repsColumn.match(repsRegex);
        if (matches && matches.length === 3) {
            return Number(matches[2]);
        }
        return false;
    }

    function canHandle(row) {
        return parseRepRange(row.reps)
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.weight));
    }

    if (canHandle(row)) {
        const reps = parseRepRange(row.reps);
        const sets = [];
        for (let i = 0; i < row.sets; i++) {
            const set = new ActivitySet(row, i + 1, "repRangeInParenthesisStrategy");
            set.reps = reps;
            sets.push(set);
        }
        return sets;
    }
    return false;
}
