const db = require('../../db');

(async function(){
    const nameLookup = await db.fileSystem.getExerciseNameList()
    const canonicalNameLookup = nameLookup.reduce((dict, next) => {
        const name = next.name.toLowerCase();
        const canonicalName = next.canonicalName === "" ? name : next.canonicalName.toLowerCase();

        dict[canonicalName] = dict[canonicalName] || new Set();
        dict[canonicalName].add(name);
        return dict;
    }, {})

    await db.fileSystem.persistCanonicalNameLookup(canonicalNameLookup);

    const retrievedCanonicalNameLookup = await db.fileSystem.getCanonicalNameLookup();

})();