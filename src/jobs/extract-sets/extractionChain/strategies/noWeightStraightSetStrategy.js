const ActivitySet = require('../../ActivitySet');
module.exports = function noWeightStraightSetStrategy(row) {
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
