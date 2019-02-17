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

# General Notes
* Consider creating directories for "row" strategies and "column" strategies, where row strategies could compose column strategies together
    * Should extract the generalizable `parseDropSetRepsForWeights` funcion inside `finalSetDoubleDropSetStrategy` to `strategies/column/weight`, and re-use it _much_ more: it's capable of handling a format like "120, 100x4, 80, 70".