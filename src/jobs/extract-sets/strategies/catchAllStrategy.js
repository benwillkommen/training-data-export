const ActivitySet = require('../ActivitySet');
module.exports = function catchAllStrategy(row) {
    const set = new ActivitySet(row, undefined, "catchAllStrategy");
    set.anomalous = true;
    set.originalData = row;
    return [set];
}
