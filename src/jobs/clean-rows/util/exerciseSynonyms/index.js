const db = require('../../../../db');

(async function(){
    const synonymnList = await db.fileSystem.getExerciseSynonymList()
    const canonicalNameLookup = synonymnList.reduce((dict, next) => {
        const name = next.name.toLowerCase();
        const canonicalName = next.canonicalName === "" ? name : next.canonicalName.toLowerCase();

        dict[canonicalName] = dict[canonicalName] || new Set();
        dict[canonicalName].add(name);
        return dict;
    }, {})

    const nameLookup = synonymnList.reduce((dict, next) => {
        const name = next.name.toLowerCase();
        const canonicalName = next.canonicalName === "" ? name : next.canonicalName.toLowerCase();

        dict[name] = canonicalName;
        return dict;
    }, {});

    const cleanedSynonymList = Object.keys(nameLookup).map(name => {
        return { name: name, canonicalName: nameLookup[name] }
    });

    await db.fileSystem.persistExerciseSynonymList(cleanedSynonymList);

    await db.fileSystem.persistCanonicalNameLookup(canonicalNameLookup);
})();