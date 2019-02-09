module.exports = function repRangeInParenthesisStrategy(row) {
    // TODO
    //"(8-10)".match(/\((\d+)-(\d+)\)/)
    const repsRegex = /\((\d+)-(\d+)\)/;

    function parseRepRange(repsColumn) {
        const matches = repsColumn.match(repsRegex);
        if (matches && matches.count === 3) {
            return Number(matches[2]);
        }
        return false;
    }

    function canHandle(row) {
        return parseRepRange(row.reps)
            && !isNaN(Number(row.sets))
            && !isNaN(Number(row.weight));
    }

    if (canHandle(row)) {
        const reps = parseRepRange(row.reps);
        const sets = [];
        for (let i = 0; i < row.sets; i++) {
            const set = new ActivitySet(row, i + 1, "repRangeInParenthesisStrategy");
            set.reps = reps;
            sets.push(set);
        }
        return sets;
    }
    return false;
}
