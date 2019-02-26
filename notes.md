# Novel Test Cases

### Drop Sets

```
// .filter(r =>    r.week === "139" && 
//                 r.day === "1" &&
//                 r.exercise === "Leg Extensions");
// .filter(r =>    r.week === "140" && 
//                 r.day === "1" &&
//                 r.exercise === "Leg Press");
// .filter(r =>    r.week === "145" && 
//                 r.day === "2" &&
//                 r.exercise === "Flat DB Bench Press");
```

### Rep Ranges with Reps in Weight Column
E.g. (12-15) reps, 25x12 weight
```
// .filter(r =>    r.week === "139" && 
//                 r.day === "1" &&
//                 r.exercise === "Leg Extensions");
```

### Set Ranges with Sets, Reps, and Weight Specified in Weight Column
e.g. (2-3) sets, 8 reps, weight column enterd as "3x8x245"
```
// .filter(r =>    r.week === "1" && 
//                 r.day === "4" &&
//                 r.exercise === "Close Grip Bench Press");
```

### Compound Sets with Different Weights Specified
e.g. 3 sets, 10+10 reps, "10 reps followed by 10 partials at the top", weight 95, 75, 75
```
// .filter(r =>    r.week === "67" && 
//                 r.day === "2" &&
//                 r.exercise === "Strip The Rack Presses");
```

### Weeks 1 through 20ish: Set ranges with Shittily Formatted Weight Column
e.g. Week 17, Day 1, (2-4) sets 6, reps, weight column entered as "2x205" to indicate how many sets were done.

# General Notes
* Consider creating directories for "row" strategies and "column" strategies, where row strategies could compose column strategies together
    * Should extract the generalizable `parseDropSetRepsForWeights` funcion inside `finalSetDoubleDropSetStrategy` to `strategies/column/weight`, and re-use it _much_ more: it's capable of handling a format like "120, 100x4, 80, 70".