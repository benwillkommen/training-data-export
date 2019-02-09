const db = require('../../db');

const SPREADSHEET_ID = process.argv[2] || '1Au638nEKSAa2xl8WucH_XW3tw8urKooXJHr9kmlkf1E';

(async function () {
    const sheetsFromGoogleDrive = await db.googleSheets.getSheets(SPREADSHEET_ID);
    const { persistedSheets, batchPath } = await db.fileSystem.persistSheets(sheetsFromGoogleDrive);
    console.log(`Raw sheet responses saved to: ${batchPath}`);
})();