const ActivitySet = require('../ActivitySet');
module.exports = function dropSetStrategy(row) {
    function isDropDownSet(instructions) {
        const i = instructions.toLowerCase();
        if (i.match(/drop\s?(down|set)/)) {
            return true;
        }
        return false;
    }
    function parseDropSetWeight(weightColumn) {
        const tokens = weightColumn.split(",");
        if (tokens.every(t => !isNaN(Number(t)))) {
            return tokens.map(t => Number(t));
        }
        return false;
    }
    function canHandle(row, parsedWeights) {
        return isDropDownSet(row.instructions)
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.reps))
            && parsedWeights !== false;
    }
    const parsedWeights = parseDropSetWeight(row.weight.toString());
    if (canHandle(row, parsedWeights)) {
        const dropsetId = uuid();
        const sets = [];
        let setNumber = 1;
        for (let i = 0; i < Number(row.sets); i++) {
            for (let j = 0; j < parsedWeights.length; j++) {
                sets.push(new ActivitySet(row, setNumber, "dropSetStrategy", null, parsedWeights[j], dropsetId));
                setNumber += 1;
            }
        }
        return sets;
    }
    return false;
}
