const fse = require('fs-extra');
const { promisify } = require('util');
const sleep = require('system-sleep');
const { TRAINING_DATA_DIR } = require("./process-rows");
function downloadSheetsAsync(spreadsheetId, sheetTitles, sheetsClient, downloadBatchDirectoryName) {
    //sheetTitles = sheetTitles.filter(title => title === "Week 99"); // comment when ready to process them all
    const getSheetAsync = promisify(sheetsClient.spreadsheets.values.get);
    const sheetPromises = sheetTitles.map(sheetTitle => {
        sleep(200);
        console.log(`getting sheet: ${sheetTitle}`);
        return getSheetAsync({
            spreadsheetId: spreadsheetId,
            range: sheetTitle,
        }).then(s => {
            s.data.sheetTitle = sheetTitle;
            return s;
        }).then(s => {
            const filePath = `${TRAINING_DATA_DIR}/sheet-json-responses/${downloadBatchDirectoryName}/${s.data.sheetTitle}.json`;
            fse.outputFile(filePath, JSON.stringify(s.data, null, 3));
            return s;
        });
    });
    return sheetPromises;
}
exports.downloadSheetsAsync = downloadSheetsAsync;
