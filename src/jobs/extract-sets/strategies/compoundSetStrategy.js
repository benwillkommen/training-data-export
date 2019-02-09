const ActivitySet = require('../ActivitySet');
module.exports = function compoundSetStrategy(row) {
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
