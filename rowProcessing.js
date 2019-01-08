function isCellEmpty(cell) {
    return cell === undefined || cell === null || cell.trim() === "";
}

function isRowEmpty(row){
    return row.findIndex(cell => !isCellEmpty(cell)) === -1
}

function stripBodyWeightRows(rows){
    const startIndex = rows.findIndex(row => row.length > 0 && row[0] === "Bodyweight")

    return rows.slice(0, startIndex);
}

function extractDay(rows, day) {
    const searchString = `Day ${day}`;
    const startIndex = rows.findIndex(row => row.length > 0 && row[0] === searchString)
    const endIndex = rows.findIndex((row, index) => index > startIndex && row.length > 0 && !isCellEmpty(row[0]));

    return rows.slice(startIndex + 1, endIndex).map(r => {
        r[0] = day;
        return r;
    });
}


module.exports = {
    isCellEmpty,
    isRowEmpty,
    stripBodyWeightRows,
    extractDay
}