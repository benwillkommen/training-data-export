const uuid = require('uuid');
const { consolidateSheet } = require('./sheetConsolidation');
const db = require('../../../db');
const { COLUMN_HEADERS } = require('../../../constants');
module.exports = {
    ensureAllColumnsExist(rows) {
        return rows.map(r => {
            const fillerArray = [];
            for (let i = 0; i < COLUMN_HEADERS.length - r.length; i++) {
                fillerArray.push("");
            }
            return r.concat(fillerArray);
        });
    },
    cleanSheets(sheets) {
        return sheets.map(consolidateSheet)
    },
    flattenSheets(sheets) {
        return sheets.reduce((prev, curr) => prev.concat(curr), [])
    },
    addHeaders(rows) {
        rows.unshift(COLUMN_HEADERS)
        return rows;
    },
    fillInBlankExerciseNames(rows) {
        for (let i = 0; i < rows.length; i++) {
            const currentRow = rows[i];
            if (currentRow[3].trim() === "") {
                currentRow[3] = rows[i - 1][3];
            }
            if (currentRow[4].trim() === "") {
                currentRow[4] = rows[i - 1][4];
            }
        }
        return rows;
    },
    associateSuperSets: require('./associateSuperSets'),
    async addCanonicalNameColumn(rows) {
        const exerciseNameLookup = await db.fileSystem.getExerciseNameLookup();
        const rowsWithCanonicalNames = rows.map(row => {
            const name = row[3]
            const canonicalName = exerciseNameLookup[name.toLowerCase()] || "";
            row.splice(3, 0, canonicalName);
            return row;
        });
        return rowsWithCanonicalNames;
    }

}
