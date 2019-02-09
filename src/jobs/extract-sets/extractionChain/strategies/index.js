module.exports = {
    noWeightStraightSetStrategy: require('./noWeightStraightSetStrategy'),
    straightSetStrategy: require('./straightSetStrategy'),
    compoundSetStrategy: require('./compoundSetStrategy'),
    differentWeightsPerSetStrategy: require('./differentWeightsPerSetStrategy'),
    differentRepsPerSetsStrategy: require('./differentRepsPerSetsStrategy'),
    finalSetDropSetStrategy: require('./finalSetDropSetStrategy'),
    plusSignDelimitedRepsDropSetStrategy: require('./plusSignDelimitedRepsDropSetStrategy'),
    dropSetStrategy: require('./dropSetStrategy'),
    failureSpecifiedInRepsColumnAndNoWeightStrategy: require('./failureSpecifiedInRepsColumnAndNoWeightStrategy'),
    repRangeInParenthesisStrategy: require('./repRangeInParenthesisStrategy'),
    catchAllStrategy: require('./catchAllStrategy')
}