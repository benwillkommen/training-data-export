const ActivitySet = require('../../ActivitySet');
module.exports = function failureSpecifiedInRepsColumnAndNoWeightStrategy(row) {
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
            return new ActivitySet(rowCopy, i + 1, "failureSpecifiedInRepsColumnAndNoWeightStrategy");
        });
    }
    return false;
}


