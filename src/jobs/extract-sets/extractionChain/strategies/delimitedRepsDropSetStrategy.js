const uuid = require('uuid');
const ActivitySet = require('../../ActivitySet');
module.exports = function delimitedRepsDropSetStrategy(row) {
    ///	Incline DB Flyes	3	10+6	10 reps then drop down 6 more	45, 35
    ///	Flat DB Bench	1	8, 8	Drop down set	100, 75
    function parseDropSetWeight(weightColumn) {
        const tokens = weightColumn.split(",");
        if (tokens.every(t => !isNaN(Number(t)))) {
            return tokens.map(t => Number(t));
        }
        return false;
    }

    function getDelimeter(repsColumn) {
        if (repsColumn.includes("+")) {
            return "+";
        }
        if (repsColumn.includes(",")) {
            return ",";
        }
        return false;
    }

    function parseDropSetReps(repsColumn) {
        const delimeter = getDelimeter(repsColumn);
        if (delimeter !== false) {
            const tokens = repsColumn.split(delimeter);
            if (tokens.length < 2) {
                // let's only handle "+"" delimited reps with this strategy
                return false;
            }
            if (tokens.every(t => !isNaN(Number(t)))) {
                return tokens.map(t => Number(t));
            }
        }
        return false;
    }
    function isDropDownSet(instructions) {
        const i = instructions.toLowerCase();
        if (i.match(/drop\s?(down|set)/)) {
            return true;
        }
        return false;
    }
    function canHandle(row, parsedWeights, parsedReps) {
        return isDropDownSet(row.instructions)
            && !isNaN(Number(row.sets))
            && parsedReps !== false
            && parsedWeights !== false
            && parsedReps.length === parsedWeights.length;
    }
    const parsedWeights = parseDropSetWeight(row.weight.toString());
    const parsedReps = parseDropSetReps(row.reps.toString());

    if (canHandle(row, parsedWeights, parsedReps)) {
        const dropsetId = uuid();
        const sets = [];
        let setNumber = 1;
        for (let i = 0; i < Number(row.sets); i++) {
            for (let j = 0; j < parsedWeights.length; j++) {
                sets.push(new ActivitySet(row, setNumber, "delimitedRepsDropSetStrategy", parsedReps[j], parsedWeights[j], dropsetId));
                setNumber += 1;
            }
        }
        return sets;
    }
    return false;
}
