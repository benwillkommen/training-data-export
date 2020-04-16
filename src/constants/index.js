module.exports = {
    TRAINING_DATA_DIR: process.env.TRAINING_DATA_DIR || "./data",
    COLUMN_HEADERS: ["inferredDate", "weekStartDate", "week", "day", "canonicalName", "originalName", "sets", "reps", "instructions", "weight", "notes", "supersetId"],
    GOOGLE_SHEETS_API_SLEEP_MS: 250
}