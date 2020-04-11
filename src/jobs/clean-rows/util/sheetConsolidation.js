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

function normalizeDayName(row){
    const dayNameLookup = {
        "monday": "Day 1",
        "tuesday": "Day 2",
        "thursday": "Day 3",
        "friday": "Day 4"
    }
    if (dayNameLookup[row[0].toLowerCase()]){
        const normalizedRow = JSON.parse(JSON.stringify(row));
        normalizedRow[0] = dayNameLookup[row[0].toLowerCase()]
        return normalizedRow;
    }
    return row;
}

function consolidateSheet(sheet) {
    const rows = sheet.values;
    const cleanedRows = stripBodyWeightRows(rows.filter(r => !isRowEmpty(r)));
    const dayNameNormalizedRows = cleanedRows.map(row => normalizeDayName(row))
    const specialCharsRemovedRows = dayNameNormalizedRows.map(row => row.map(cell => typeof cell === "string" ? cell.replace(/["]*/g, "") : cell));
    const dayLabeledRows = extractDays(specialCharsRemovedRows, 1);
    const weekLabeledRows = dayLabeledRows.map(r => {
        r.unshift(parseInt(sheet.sheetTitle.match(/Week (\d+)/)[1]));
        return r;
    });

    const rowsWithStartDates = addWeekStartDate(weekLabeledRows, sheet.sheetTitle);

    return rowsWithStartDates;
}

function addWeekStartDate(rows, sheetTitle) {
    const matches = sheetTitle.match(/(\d{4}(-|\/)\d{2}(-|\/)\d{2})/);
    const weekStartDate = matches ? matches[0].replace(/\//g, '-') : "";
    return rows.map(r => [weekStartDate].concat(r));
}

module.exports = {
    consolidateSheet,
    isCellEmpty,
    isRowEmpty,
    stripBodyWeightRows,
    extractDay
}