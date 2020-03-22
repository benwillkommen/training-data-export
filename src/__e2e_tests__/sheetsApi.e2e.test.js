const { getGoogleSheetsClient } = require('../db/repositories/googleSheets/auth');

test("can successfully call the sheets API", async () => {
    const spreadsheetId = '1CEL_GMcq8Y04LpHbsqa7HMFH1tqpXaYAr9Eqjpepuew';
    const sheetsClient = await getGoogleSheetsClient();

    const response = await sheetsClient.spreadsheets.get({ spreadsheetId });
    expect(response.status).toBe(200);
});