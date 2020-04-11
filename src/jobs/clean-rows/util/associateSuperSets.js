const uuid = require('uuid');
module.exports = function associateSuperSets(cleanedRows) {
    const superSetIndices = cleanedRows
        .map((row, i) => { return { value: row[3].toLowerCase().trim(), index: i }; })
        .filter(rowObj => rowObj.value.includes("superset"))
        .map(rowObj => rowObj.index);
    const groupedSuperSetIndices = superSetIndices.reduce((collection, next) => {
        if (collection.length === 0) {
            return [[next]];
        }
        const lastGroup = collection.slice(-1)[0];
        const lastValue = lastGroup.slice(-1)[0];
        if (next - lastValue > 2) {
            return collection.concat([[next]]);
        }
        return collection.slice(0, -1).concat([lastGroup.concat(next)]);
    }, []);
    const superSetRanges = groupedSuperSetIndices.map(si => {
        return {
            id: uuid(),
            start: si[0] - 1,
            end: si.slice(-1)[0] + 1
        };
    });
    const rowsWithAssociatedSuperSets = cleanedRows.map((row, i) => {
        for (let superSetRange of superSetRanges) {
            if (i >= superSetRange.start && i <= superSetRange.end) {
                return row.slice(0, -1).concat(superSetRange.id);
            }
        }
        return row.slice(0, -1).concat("");
    }).filter((row, i) => !superSetIndices.includes(i));
    return rowsWithAssociatedSuperSets;
}
