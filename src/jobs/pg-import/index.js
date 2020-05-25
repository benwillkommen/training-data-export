const Sequelize = require('sequelize');
const { Op } = Sequelize;
const moment = require('moment');
const setupDb = require('./setupDb')

const schemaSketch = require('./data/schemaSketch');
const exerciseNames = require('./data/value-objects/exercise-names');
const dimensionValueObjects = require('./data/value-objects/dimensions');

const { fileSystem: { getExtractedSets } } = require('../../db');


(async () => {

  const db = await setupDb();

  for (const dimension of dimensionValueObjects) {
    await db.Dimension.create({
      name: dimension.name,
      type: dimension.type
    })
  }

  const defaultStrengthTrainingDimensions = await db.Dimension.findAll({
    where: {
      [Op.or]: [{ name: "reps" }, { name: "weight (lbs)" }]
    }
  });
  const reps = defaultStrengthTrainingDimensions.filter(d => d.name === 'reps')[0]
  const weight = defaultStrengthTrainingDimensions.filter(d => d.name === 'weight (lbs)')[0]

  try {
    for (const exercise of exerciseNames) {
      db.sequelize.transaction(async (transaction) => {
        const instance = await db.Exercise.create({
          name: exercise,
        }, { transaction });
        await instance.setDefaultDimensions([
          reps.dimensionId,
          weight.dimensionId
        ], { transaction })
      });
    }
  } catch (ex) {
    console.log(ex);
  }


  // TODO - include this as a test case: creating a SetDimension wihtout a Set should throw
  //        due to constraints
  // const detatchedSetDimension1 = await db.SetDimension.create({
  //   value: '69',
  //   dimensionId: 2
  // })


  //TODO - include test case verifying that Exercises are pulled back with defaultDimensions
  // const benchExercise = await db.Exercise.findOne({
  //   include: db.Exercise.associations.defaultDimensions,
  //   where: { name: 'bench press' }
  // });

  //TODO - include test case verifying that peristed Set can be pulled back with
  //       related SetDimensions, and Dimension
  // const fetchedSet = await db.Set.findOne({
  //   include: [
  //     {
  //       model: db.SetDimension, include: [
  //         { model: db.Dimension, as: 'dimension' }
  //       ]
  //     },
  //     { model: db.Exercise, as: 'exercise' },
  //   ],
  //   where: { exerciseId: benchExercise.exerciseId }
  // });

  const exercisesFromDb = await db.Exercise.findAll()

  const extractedSets = await getExtractedSets()

  const failedInserts = [];
  for (const flatSet of extractedSets) {
    const exercise = exercisesFromDb.filter(e => e.name === flatSet.exercise)[0]

    try {
      await db.Set.create({
        logDate: moment(flatSet.inferredDate),
        number: Number(flatSet.setNumber),
        exerciseId: exercise.exerciseId,
        setDimensions: [
          {
            value: Number(flatSet.reps),
            dimensionId: reps.dimensionId,
          },
          {
            value: Number(flatSet.weight),
            dimensionId: weight.dimensionId,
          }
        ]
      }, {
        include: [{
          association: db.Set.associations.setDimensions
        }, {
          association: db.Set.associations.exercise
        }]
      });
    } catch (ex) {
      failedInserts.push({
        flatSet,
        ex
      })
    }
  }

  console.log(failedInserts);
  await db.sequelize.close();
})();