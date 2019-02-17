module.exports = function parseWeightColumn(weightColumn, defaultReps) {
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