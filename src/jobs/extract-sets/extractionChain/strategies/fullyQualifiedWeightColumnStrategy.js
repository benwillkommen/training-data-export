const ActivitySet = require('../../ActivitySet');
const parseFullyQualifiedWeightColumn = require('./columnParsers/parseFullyQualifiedWeightColumn');

module.exports = function fullyQualifiedWeightColumnStrategy (row) {
    const sets = parseFullyQualifiedWeightColumn(row.weight.toString(), Number(row.reps));
    if (sets) {
        return sets.map((el, i) => new ActivitySet(row, i + 1, "fullQualifiedWeightColumnStrategy", el.reps, el.weight))
    }
    return false;
}