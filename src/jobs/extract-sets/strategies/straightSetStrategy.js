const ActivitySet = require('../ActivitySet');
module.exports = function straightSetStrategy(row) {
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
