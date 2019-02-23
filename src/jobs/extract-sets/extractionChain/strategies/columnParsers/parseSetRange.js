module.exports = function parseSetRange(setsColumn) {
    const matches = setsColumn.match(/\((\d+)-(\d+)\)/);
    if (matches === null) {
        return false;
    }
    return { minSets: Number(matches[1]), maxSets: Number(matches[2]) };
}