const uuid = require('uuid/v4');
class ActivitySet {
    constructor(row, setNumber, strategyUsed, reps, weight, dropSetId) {
        this.id = uuid();
        this.week = row.week;
        this.day = row.day;
        this.exercise = row.canonicalName;
        this.originalExerciseName = row.originalName;
        this.setNumber = setNumber;
        this.reps = Number(reps) || Number(row.reps);
        this.instructions = row.instructions;
        this.weight = Number(weight) || Number(row.weight);
        this.notes = row.notes;
        this.supersetId = row.supersetId;
        this.anomalous = false;
        this.strategyUsed = strategyUsed,
        this.dropSetId = dropSetId;
    }
}

module.exports = ActivitySet;