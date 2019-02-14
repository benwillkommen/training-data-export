module.exports = function ignoreRowStrategy(row) {
    if (row.notes.includes("META: IGNORE")) {
        return [];
    }
    return false;
}
