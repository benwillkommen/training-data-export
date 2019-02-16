const uuid = require('uuid');
const ActivitySet = require('../../ActivitySet');
module.exports = function finalSetDoubleDropSetStrategy(row) {
    function isFinalDoubleDropDownSet(instructions) {
        const i = instructions.toLowerCase();
        if (i.match(/drop\s?(down|set)/) && i.match(/final set|last set/) && i.includes('double')) {
            return true;
        }
        return false;
    }
    function parseDropSetRepsForWeights(weightColumn, defaultReps) {
        const sets = weightColumn.split(",");
        const badParse = Symbol();
        const repsForWeights = sets
            .map(set => {
                const weightByReps = set.trim().split("x").map(wbr => Number(wbr));
                if (weightByReps.every(wbr => !isNaN(wbr))) {
                    if (weightByReps.length === 1) {
                        return {
                            weight: weightByReps[0],
                            reps: defaultReps
                        };
                    }
                    else if (weightByReps.length === 2) {
                        return {
                            weight: weightByReps[0],
                            reps: weightByReps[1]
                        };
                    }
                }
                return badParse;
            });
        if (repsForWeights.some(rfw => rfw === badParse)) {
            return false;
        }
        return repsForWeights;
    }
    function canHandle(row, parsedRepsForWeights) {
        return isFinalDoubleDropDownSet(row.instructions)
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.reps))
            && parsedRepsForWeights !== false;
    }
    const repsForWeights = parseDropSetRepsForWeights(row.weight.toString(), Number(row.reps));
    if (canHandle(row, repsForWeights)) {
        const numberOfSets = Number(row.sets);
        return repsForWeights.reduce((agg, next, i) => {
            if (i === 0) {
                return agg.concat([...Array(numberOfSets)]
                    .map((el, i) => new ActivitySet(row, i + 1, "finalSetDoubleDropSetStrategy", next.reps, next.weight, i + 1 === numberOfSets ? uuid() : null)));
            }
            return agg.concat(new ActivitySet(row, agg.slice(-1)[0].setNumber + 1, "finalSetDoubleDropSetStrategy", next.reps, next.weight, agg.slice(-1)[0].dropSetId));
        }, []);
    }
    return false;
}
