module.exports = {
    noWeightStraightSetStrategy: require('./noWeightStraightSetStrategy'),
    straightSetStrategy: require('./straightSetStrategy'),
    compoundSetStrategy: require('./compoundSetStrategy'),
    differentWeightsPerSetStrategy: require('./differentWeightsPerSetStrategy'),
    differentRepsPerSetsStrategy: require('./differentRepsPerSetsStrategy'),
    finalSetDropSetStrategy: require('./finalSetDropSetStrategy'),
    delimitedRepsDropSetStrategy: require('./delimitedRepsDropSetStrategy'),
    dropSetStrategy: require('./dropSetStrategy'),
    failureSpecifiedInRepsColumnAndNoWeightStrategy: require('./failureSpecifiedInRepsColumnAndNoWeightStrategy'),
    repRangeInParenthesisStrategy: require('./repRangeInParenthesisStrategy'),
    partialRepsStrategy: require('./partialRepsStrategy'),
    catchAllStrategy: require('./catchAllStrategy')
}