function isCellEmpty(cell) {
    return cell === undefined || cell === null || cell.trim() === "";
}

function isRowEmpty(row) {
    return row.findIndex(cell => !isCellEmpty(cell)) === -1
}

function stripBodyWeightRows(rows) {
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

function extractDays(cleanedRows) {
    return extractDay(cleanedRows, 1).concat(extractDay(cleanedRows, 2)).concat(extractDay(cleanedRows, 3)).concat(extractDay(cleanedRows, 4));
}

function consolidate(sheet) {
    const rows = sheet.values;
    const cleanedRows = stripBodyWeightRows(rows.filter(r => !isRowEmpty(r)));
    const specialCharsRemovedRows = cleanedRows.map(row => row.map(cell => typeof cell === "string" ? cell.replace(/["]*/g, "") : cell));
    const dayLabeledRows = extractDays(specialCharsRemovedRows, 1);
    const weekLabeledRows = dayLabeledRows.map(r => {
        r.unshift(parseInt(sheet.sheetTitle.replace(/\D/g, '')));
        return r;
    });

    return weekLabeledRows;
}

module.exports = {
    consolidate,
    util: {
        isCellEmpty,
        isRowEmpty,
        stripBodyWeightRows,
        extractDay
    }
}