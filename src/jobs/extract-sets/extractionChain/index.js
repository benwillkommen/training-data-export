const {
    noWeightStraightSetStrategy,
    straightSetStrategy,
    compoundSetStrategy,
    differentWeightsPerSetStrategy,
    differentRepsPerSetsStrategy,
    finalSetDropSetStrategy,
    delimitedRepsDropSetStrategy,
    dropSetStrategy,
    failureSpecifiedInRepsColumnAndNoWeightStrategy,
    repRangeInParenthesisStrategy,
    partialRepsStrategy,
    failureSpecifiedInRepsColumnWithWeightStrategy,
    catchAllStrategy,
    ignoreRowStrategy,
    differentRepsEachSetStrategy
} = require('./strategies');

const orderedStrategies = [
    ignoreRowStrategy,
    noWeightStraightSetStrategy,
    straightSetStrategy,
    compoundSetStrategy,
    partialRepsStrategy,
    finalSetDropSetStrategy,
    dropSetStrategy,
    delimitedRepsDropSetStrategy,
    differentWeightsPerSetStrategy,
    differentRepsPerSetsStrategy,
    failureSpecifiedInRepsColumnAndNoWeightStrategy,
    repRangeInParenthesisStrategy,
    failureSpecifiedInRepsColumnWithWeightStrategy,
    differentRepsEachSetStrategy,
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
                console.log(row.exercise, ex);
            }
        }
    }

    return sets;
}

module.exports = {
    extractSets,
    orderedStrategies
}