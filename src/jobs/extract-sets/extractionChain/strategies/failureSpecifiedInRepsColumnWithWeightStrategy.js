const ActivitySet = require('../../ActivitySet');
const parseWeightColumn = require('./columnParsers/parseWeightColumn')
module.exports = function failureSpecifiedInRepsColumnWithWeightStrategy(row) {

    function canHandle(row, weightForReps) {
        return row.reps.toString().toLowerCase().trim().match(/failure|max/)
            && !isNaN(Number(row.sets))
            && weightForReps
            && weightForReps.length === Number(row.sets);
    }
    
    const weightForReps = parseWeightColumn(row.weight);
    if (canHandle(row, weightForReps)) {
        return weightForReps.map((wfr, i) => new ActivitySet(row, i + 1, "failureSpecifiedInRepsColumnWithWeightStrategy", wfr.reps, wfr.weight));
    }
    return false;
}
