const fs = require('fs');
const { google } = require('googleapis');
const authorize = require('./authorize')
const { promisify } = require('util');

const SPREADSHEET_ID = process.argv[2] || '1Au638nEKSAa2xl8WucH_XW3tw8urKooXJHr9kmlkf1E'

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);

    function withAuth(callback, spreadsheetId, auth) {
        callback(spreadsheetId, auth);
    }

    const processWithAuth = withAuth.bind(null, downloadSpreadsheetAsync, SPREADSHEET_ID);

    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), processWithAuth);
});



/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.get({
        spreadsheetId: '1Au638nEKSAa2xl8WucH_XW3tw8urKooXJHr9kmlkf1E',
        range: 'Week 150',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            console.log('Name, Major:');
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
                //console.log(`${row[0]}, ${row[4]}`);
                console.log(row)
            });
        } else {
            console.log('No data found.');
        }
    });
}

function downloadSpreadsheetAsync(spreadsheetId, auth) {
    const sheetsClient = google.sheets({ version: 'v4', auth });
    const getSpreadsheetAsync = promisify(sheetsClient.spreadsheets.get);

    getSpreadsheetAsync({ spreadsheetId })
        .then(res => res.data.sheets.map(s => s.properties.title))
        .then(sheetTitles => getSheetsAsync(spreadsheetId, sheetTitles, sheetsClient))
        .then(sheets => {
            console.log(sheets)
        })
    // .then(sheetTitles => {
    //     //const sheetTitles = res.data.sheets.map(s => s.properties.title);
    //     processSheets(spreadsheetId, sheetTitles, sheetsClient);
    //     return res;
    // }).then(asdf => {
    //     console.log(asdf);
    // });
}

function getSheetsAsync(spreadsheetId, sheetTitles, sheetsClient) {
    sheetTitles = sheetTitles.slice(0, 3); // uncomment when ready to process them all

    const getSheetAsync = promisify(sheetsClient.spreadsheets.values.get);

    const sheetPromises = sheetTitles.map(sheetTitle => {
        return getSheetAsync({
            spreadsheetId: spreadsheetId,
            range: sheetTitle,
        }).then(s => {
            s.data.sheetTitle = sheetTitle;
            return s;
        });
    }); 

    return Promise.all(sheetPromises);
}

function downloadSpreadsheet(spreadsheetId, auth) {
    const sheetsClient = google.sheets({ version: 'v4', auth });
    sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheetId
    }, (err, res) => {
        const sheetTitles = res.data.sheets.map(s => s.properties.title);
        processSheets(spreadsheetId, sheetTitles, sheetsClient);
    });
}

function processSheets(spreadsheetId, sheetTitles, sheetsClient) {
    sheetTitles = sheetTitles.slice(0, 1); // uncomment when ready to process them all

    sheetTitles.map(sheetTitle => {
        sheetsClient.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: sheetTitle,
        }, (err, res) => {
            const rows = res.data.values;
            if (rows.length) {
                console.log('Name, Major:');
                // Print columns A and E, which correspond to indices 0 and 4.
                rows.map((row) => {
                    //console.log(`${row[0]}, ${row[4]}`);
                    console.log(row)
                });
            }
        })
    })


}

function processSheetsAsync(spreadsheetId, sheetTitles, sheetsClient) {
    sheetTitles = sheetTitles.slice(0, 1); // uncomment when ready to process them all

    sheetTitles.map(sheetTitle => {

        sheetsClient.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: sheetTitle,
        }, (err, res) => {
            const rows = res.data.values;
            if (rows.length) {
                console.log('Name, Major:');
                // Print columns A and E, which correspond to indices 0 and 4.
                rows.map((row) => {
                    //console.log(`${row[0]}, ${row[4]}`);
                    console.log(row)
                });
            }
        })
    })


}