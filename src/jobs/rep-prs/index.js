const db = require('../../db');

(async function () {
    const sets = (await db.fileSystem.getExtractedSets())
        .map(set => {
            set.week = Number(set.week);
            set.day = Number(set.day);
            set.setNumber = Number(set.setNumber);
            set.weight = Number(set.weight);
            set.reps = Number(set.reps);
            return set;
        })
        .sort((a, b) => (a.week + (a.day / 10)) - (b.week + (b.day / 10)))
        
    const repPRs = sets.reduce((dict, nextSet) => {
        dict[nextSet.exercise] = dict[nextSet.exercise] || {};
        dict[nextSet.exercise][Number(nextSet.reps)] = dict[nextSet.exercise][Number(nextSet.reps)] || [];
        
        const currentPRs = dict[nextSet.exercise][Number(nextSet.reps)];
        
        if (currentPRs.length === 0 || currentPRs.slice(-1)[0].weight < nextSet.weight) {
            currentPRs.push(nextSet);
        }

        return dict;
    }, {})

    const directory = await db.fileSystem.persistRepPRs(repPRs);

    console.log(`rep PRs json persisted to "${directory}"`);
    console.log(repPRs)
})();
