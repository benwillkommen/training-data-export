const ActivitySet = require('../../ActivitySet');
module.exports = function differentWeightsPerSetStrategy(row) {
    function parseWeightColumn(weightColumn) {
        const tokens = weightColumn.split(",");
        const weightsForSets = tokens
            .map(token => token.trim().split("x").map(t => Number(t)))
            .map(pair => pair.length === 1 ? pair.concat(1) : pair)
            .reduce((collection, nextPair) => {
                const sets = [];
                for (let i = 0; i < nextPair[1]; i++) {
                    sets.push(nextPair[0]);
                }
                return collection.concat(sets);
            }, []);
        return weightsForSets;
    }
    function isWeightForSetsValid(weightForSets, sets) {
        return sets === weightForSets.length;
    }
    function canHandle(row, validWeightForSets) {
        return validWeightForSets
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.reps));
    }
    const weightForSets = parseWeightColumn(row.weight.toString());
    const validWeightForSets = isWeightForSetsValid(weightForSets, Number(row.sets));
    if (canHandle(row, validWeightForSets)) {
        const sets = [];
        for (let i = 0; i < weightForSets.length; i++) {
            const set = new ActivitySet(row, i + 1, "differentWeightsPerSetStrategy");
            set.weight = weightForSets[i];
            sets.push(set);
        }
        return sets;
    }
    return false;
}
