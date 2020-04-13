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
    differentRepsEachSetStrategy,
    finalSetDoubleDropSetStrategy,
    setRangeInParenthesisStrategy,
    fullyQualifiedWeightColumnStrategy
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
    finalSetDoubleDropSetStrategy,
    setRangeInParenthesisStrategy,
    fullyQualifiedWeightColumnStrategy,
    catchAllStrategy
];

function extractSets(cleanedRows) {
    let sets = []
    let exceptions = [];

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
                //console.log(ex, `Week ${row.week}, Day ${row.day}, ${row.exercise}`, row, "");
                exceptions.push({ ex, row });
            }
        }
    }

    return { sets, exceptions };
}

module.exports = {
    extractSets,
    orderedStrategies
}