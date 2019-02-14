const uuid = require('uuid');
const ActivitySet = require('../../ActivitySet');
module.exports = function finalSetDropSetStrategy(row) {
    function isFinalDropDownSet(instructions) {
        const i = instructions.toLowerCase();
        if (i.match(/drop\s?(down|set)/) && i.match(/final set|last set/)) {
            return true;
        }
        return false;
    }
    function parseDropSetWeight(weightColumn) {
        const tokens = weightColumn.split(",");
        if (tokens.every(t => !isNaN(Number(t)))) {
            return tokens.map(t => Number(t));
        }
        return false;
    }
    // function parseDropSetWeight(weightColumn) {
    //     const tokens = weightColumn.split(",");
    //     const repsForWeights = tokens
    //         .map(token => token.trim().split("x").map(t => Number(t)))
    //         .map()
    //     if (tokens.every(t => !isNaN(Number(t)))) {
    //         return tokens.map(t => Number(t));
    //     }
    //     return false;
    // }
    // function parseRepsColumn(repsColumn) {
    //     const tokens = repsColumn.split(",");
    //     const repsForSets = tokens
    //         .map(token => token.trim().split("x").map(t => Number(t)))
    //         .map(pair => pair.length === 1 ? pair.concat(1) : pair)
    //         .reduce((collection, nextPair) => {
    //             const sets = [];
    //             for (let i = 0; i < nextPair[1]; i++) {
    //                 sets.push(nextPair[0])
    //             }
    //             return collection.concat(sets);
    //         }, []);
    //     return repsForSets;
    // }
    function canHandle(row, parsedWeights) {
        return isFinalDropDownSet(row.instructions)
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.reps))
            && parsedWeights !== false;
    }
    const parsedWeights = parseDropSetWeight(row.weight.toString());
    if (canHandle(row, parsedWeights)) {
        return parsedWeights.reduce((agg, nextWeight, i) => {
            if (i === 0) {
                return agg.concat([...Array(Number(row.sets))]
                    .map((el, i) => new ActivitySet(row, i + 1, "finalSetDropSetStrategy", null, Number(nextWeight), i + 1 === Number(row.sets) ? uuid() : null)));
            }
            return agg.concat(new ActivitySet(row, agg.slice(-1)[0].setNumber + 1, "finalSetDropSetStrategy", null, Number(nextWeight), agg.slice(-1)[0].dropSetId));
        }, []);
    }
    return false;
}


