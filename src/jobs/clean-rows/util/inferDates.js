const moment = require('moment');

function inferDates(rows) {
    const rowsSortedByWeek = rows.sort((a, b) => a[1] - b[1]);
    const maxWeekNumber = Math.max(...rowsSortedByWeek.map(r => r[1]));
    const rowsWithInferredDates = [];

    for (let weekNumber = 1; weekNumber <= maxWeekNumber; weekNumber++) {
        const rowsForWeek = rowsSortedByWeek.filter(r => r[1] === weekNumber);
        if (rowsForWeek.length === 0){
            continue;
        }

        let weekDateString = rowsForWeek[0][0];
        if (weekDateString === "") {
            lastWeekDateString = rowsWithInferredDates.slice(-1)[0][1];
            if (lastWeekDateString === "") {
                throw new Error(`Couldn't figure out weekDateString for week ${weekNumber}`);
            }
            weekDateString = moment(lastWeekDateString)
                .add(7, 'days')
                .format('YYYY-MM-DD');
        }
        rowsWithInferredDates.push(...labelWeekAndDayDates(weekDateString, rowsForWeek));
    }
    return rowsWithInferredDates;
}

function labelWeekAndDayDates(weekDateString, rowsForWeek){
    const weekLabeledRows = rowsForWeek.map(r => [weekDateString].concat(r.slice(1)));

    const daysLoggedInWeek = Math.max(...rowsForWeek.map(r => r[2]));

    const dayLabeledRows = weekLabeledRows.map(r => {
        const dayDate = moment(r[0])
            .add(DAY_OFFSETS[daysLoggedInWeek][r[2]], 'days')
            .format('YYYY-MM-DD');
        return [dayDate].concat(r);
    })
    return dayLabeledRows;
}

const DAY_OFFSETS = {
    1: {
        1: 4
    },
    2: {
        1: 3,
        2: 5,
    },
    3: {
        1: 2,
        2: 4,
        3: 6,
    },
    4: {
        1: 2,
        2: 3,
        3: 5,
        4: 6,
    },
    5: {
        1: 2,
        2: 3,
        3: 4,
        4: 5,
        5: 6,
    },
    6: {
        1: 1,
        2: 2,
        3: 3,
        4: 4,
        5: 5,
        6: 6,
    },
    7: {
        1: 0,
        2: 1,
        3: 2,
        4: 3,
        5: 4,
        6: 5,
        7: 6,
    },
};

module.exports = inferDates;
