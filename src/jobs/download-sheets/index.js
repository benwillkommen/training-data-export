const db = require('../../db');

const sheetIds = ['1CEL_GMcq8Y04LpHbsqa7HMFH1tqpXaYAr9Eqjpepuew', '1Au638nEKSAa2xl8WucH_XW3tw8urKooXJHr9kmlkf1E', '15TbO8vuqiADj6b3EOFpcR-VkhLDc_MkjctbqaRn-E5s'];

//const SPREADSHEET_ID = process.argv[2] || sheetIds[0];

(async function () {
    let sheets = [];
    for (let i = 0; i < sheetIds.length; i++) {
        const sheetsFromGoogleDrive = await db.googleSheets.getSheets(sheetIds[i])
        sheets = sheets.concat(sheetsFromGoogleDrive);
    }

    const { persistedSheets, batchPath } = await db.fileSystem.persistSheets(sheets);
    console.log(`Raw sheet responses saved to: ${batchPath}`);

})();