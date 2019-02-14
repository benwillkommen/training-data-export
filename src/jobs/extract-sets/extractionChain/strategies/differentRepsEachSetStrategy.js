const ActivitySet = require('../../ActivitySet');
module.exports = function differentRepsEachSetStrategy(row) {
    function parseCommaDelimitedValuesToNumbers(str) {
        const tokens = str.split(',');
        if (tokens.every(t => !isNaN(Number(t)))) {
            return tokens.map(t => Number(t));
        }
        return false;
    }
    function canHandle(row, parsedReps, parsedWeights) {
        return parsedReps &&
            parsedWeights &&
            !isNaN(Number(row.sets)) &&
            parsedReps.length === parsedWeights.length &&
            parsedWeights.length === Number(row.sets);
    }
    const parsedReps = parseCommaDelimitedValuesToNumbers(row.reps.toString());
    const parsedWeights = parseCommaDelimitedValuesToNumbers(row.weight.toString());
    if (canHandle(row, parsedReps, parsedWeights)) {
        return parsedReps.map((reps, i) => new ActivitySet(row, i + 1, "differentRepsEachSetStrategy", reps, parsedWeights[i]));
    }
    return false;
}
