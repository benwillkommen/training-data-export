const { getAuthClientAsync } = require('./authorize');
const { google } = require('googleapis');
const fs = require('fs-extra');
const { promisify } = require('util');
const fsAsync = {
    readFile: promisify(fs.readFile)
}

module.exports = {
    getGoogleSheetsClient: async function () {
        const credentials = JSON.parse(await fsAsync.readFile('credentials.json'));
        const authClient = await getAuthClientAsync(credentials);
        return google.sheets({ version: 'v4', auth: authClient });
    }
}