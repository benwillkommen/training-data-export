module.exports = function parseFullyQualifiedWeightColumn(weightColumn, defaultReps) {

    const parsedSetsByRepsByWeight = tryParseFullyQualifiedSets(weightColumn)
    if (parsedSetsByRepsByWeight === false) {
        return parseRepsByWeight(weightColumn, defaultReps);
    }
    return parsedSetsByRepsByWeight;
}

function tryParseFullyQualifiedSets(weightColumn) {
    matches = weightColumn.match(/(\d+x\d+x\d+)/g);
    if (matches !== null) {
        let sets = []
        for (let i = 0; i < matches.length; i++) {
            const parsedSets = parseSetRepWeightString(matches[i]);
            sets = sets.concat(parsedSets);
        }
        return sets;
    }
    return false;
}

function parseSetRepWeightString(srw){
    const matches = srw.match(/(\d+)x(\d+)x(\d+)/);
    const setsRepsWeight = {
        sets: Number(matches[1]),
        reps: Number(matches[2]),
        weight: Number(matches[3]),
    }
    if (setsRepsWeight.weight < setsRepsWeight.reps || setsRepsWeight.weight < setsRepsWeight.sets) {
        // possibly incorrect assumption: if reps or sets are greater than weight, there's an error
        throw new Error("sets or reps were greater than weight");
    }

    // ~sigh~... turning simple object above into array where length indicates
    // number of sets.
    return [...Array(setsRepsWeight.sets)].map(x => {
        return {
            reps: setsRepsWeight.reps,
            weight: setsRepsWeight.weight
        };
    });
}


function parseRepsByWeight(weightColumn, defaultReps) {
    const sets = weightColumn.split(",");
    const couldNotParse = Symbol();
    const repsForWeights = sets
        .map(set => {
            const weightByReps = set.trim().split("x").map(wbr => Number(wbr));
            if (weightByReps.every(wbr => !isNaN(wbr))) {
                if (weightByReps.length === 1) {
                    return {
                        weight: weightByReps[0],
                        reps: !isNaN(Number(defaultReps)) ? Number(defaultReps) : undefined
                    };
                }
                else if (weightByReps.length === 2) {
                    // potential faulty assumption: weight will always be greater than reps???
                    // probably fine a vast majority of the time.
                    const [weight, reps] = weightByReps[0] > weightByReps[1] ? weightByReps : weightByReps.reverse();
                    return {
                        weight,
                        reps
                    };
                }
            }
            return couldNotParse;
        });
    if (repsForWeights.some(rfw => rfw === couldNotParse)) {
        return false;
    }
    return repsForWeights;
}