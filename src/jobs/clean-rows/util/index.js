const uuid = require('uuid');
const { consolidateSheet } = require('./sheetConsolidation');
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
    fillInBlankExerciseNames(rows){
        for (let i = 0; i < rows.length; i++){
            const currentRow = rows[i];
            if (currentRow[2].trim() === ""){
                currentRow[2] = rows[i-1][2];
            }
        }
        return rows;
    },
    associateSuperSets: require('./associateSuperSets'),

}
 