const ActivitySet = require('../../ActivitySet');
module.exports = function differentRepsPerSetsStrategy(row) {
    function canHandle(row, validRepsForSets) {
        return validRepsForSets
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.weight));
    }
    function parseRepsColumn(repsColumn) {
        const tokens = repsColumn.split(",");
        const repsForSets = tokens
            .map(token => token.trim().split("x").map(t => Number(t)))
            .map(pair => pair.length === 1 ? pair.concat(1) : pair)
            .reduce((collection, nextPair) => {
                const sets = [];
                for (let i = 0; i < nextPair[1]; i++) {
                    sets.push(nextPair[0]);
                }
                return collection.concat(sets);
            }, []);
        return repsForSets;
    }
    function areRepsValidForSets(repsForSets, sets) {
        return sets === repsForSets.length;
    }
    const repsForSets = parseRepsColumn(row.reps.toString());
    const validRepsForSets = areRepsValidForSets(repsForSets, Number(row.sets));
    if (canHandle(row, validRepsForSets)) {
        return repsForSets.map((r, i) => {
            const set = new ActivitySet(row, i + 1, "differentRepsPerSetsStrategy");
            set.reps = r;
            return set;
        });
    }
    return false;
}
