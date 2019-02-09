const {
    noWeightStraightSetStrategy,
    straightSetStrategy,
    compoundSetStrategy,
    differentWeightsPerSetStrategy,
    differentRepsPerSetsStrategy,
    finalSetDropSetStrategy,
    plusSignDelimitedRepsDropSetStrategy,
    dropSetStrategy,
    failureSpecifiedInRepsColumnAndNoWeightStrategy,
    repRangeInParenthesisStrategy,
    catchAllStrategy
} = require('./strategies');

const orderedStrategies = [
    noWeightStraightSetStrategy,
    straightSetStrategy,
    compoundSetStrategy,
    finalSetDropSetStrategy,
    dropSetStrategy,
    plusSignDelimitedRepsDropSetStrategy,
    differentWeightsPerSetStrategy,
    differentRepsPerSetsStrategy,
    failureSpecifiedInRepsColumnAndNoWeightStrategy,
    //failureSpecifiedInRepsColumnStrategy,
    repRangeInParenthesisStrategy,
    catchAllStrategy
];

function extractSets(cleanedRows) {
    let sets = []

    for (let i = 0; i < cleanedRows.length; i++) {
        const row = cleanedRows[i];
        for (let j = 0; j < orderedStrategies.length; j++) {
            try {
                const result = orderedStrategies[j](row);
                if (result !== false) {
                    sets = sets.concat(result);
                    break;
                }
            }
            catch (ex) {
                //console.log(row.exercise, ex);
            }
        }
    }

    return sets;
}

module.exports = {
    extractSets,
    orderedStrategies
}