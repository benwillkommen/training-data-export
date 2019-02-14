const ActivitySet = require('../../ActivitySet');
module.exports = function failureSpecifiedInRepsColumnWithWeightStrategy(row) {

    function parseRepsAndWeights(weightColumn) {
        //const columnRegex = /\s*(\d+)\s*x\s*(\d+)\s*,?\s*/g;
        const tokens = weightColumn.split(",");
        const weightForReps = tokens
            .map(token => token.trim().split("x").map(t => Number(t)))
            .map(pair => {
                return { reps: pair[1], weight: pair[0] };
            });
        if (weightForReps.every(x => !isNaN(Number(x.reps) && !isNaN(Number(x.weight))))) {
            return weightForReps;
        }
        return false;
    }
    function canHandle(row, weightForReps) {
        return row.reps.toString().toLowerCase().trim().match(/^failure$|^max$/)
            && !isNaN(Number(row.sets))
            && weightForReps
            && weightForReps.length === Number(row.sets);
    }
    const weightForReps = parseRepsAndWeights(row.weight);
    if (canHandle(row, weightForReps)) {
        return weightForReps.map((wfr, i) => new ActivitySet(row, i + 1, "failureSpecifiedInRepsColumnWithWeightStrategy", wfr.reps, wfr.weight));
    }
    return false;
}
