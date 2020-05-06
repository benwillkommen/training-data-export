const Sequelize = require('sequelize');
const { Op } = Sequelize;
const {
  DB_USER,
  DB_PASSWORD,
  DB_INITIAL
} = process.env;

const Set = require('../../models/Set');
const SetDimension = require('../../models/SetDimension');
const Dimension = require('../../models/Dimension');
const Exercise = require('../../models/Exercise');

const schemaSketch = require('./data/schemaSketch');
const exerciseNames = require('./data/value-objects/exercise-names');
const dimensionValueObjects = require('./data/value-objects/dimensions');


(async () => {
  const sequelize = new Sequelize(DB_INITIAL, DB_USER, DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
  });

  // https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
  const models = {
    Set: Set.init(sequelize, Sequelize),
    SetDimension: SetDimension.init(sequelize, Sequelize),
    Dimension: Dimension.init(sequelize, Sequelize),
    Exercise: Exercise.init(sequelize, Sequelize)
  }

  // Run `.associate` if it exists,
  // ie create relationships in the ORM
  Object.values(models)
    .filter(model => typeof model.associate === "function")
    .forEach(model => model.associate(models));

  await sequelize.sync({ force: true });

  const db = {
    ...models,
    sequelize
  }

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
      await db.Exercise.create({
        name: exercise,
        defaultDimensions: [
          // reps,
          // weight
        ]
      }, {
        include: [{
          association: Exercise.DefaultDimensions,
          include: [Exercise.DefaultDimensions]
        }]
      })
    }
  } catch (ex) {
    console.log(ex);
  }

  const detatchedSetDimension1 = await db.SetDimension.create({
    value: '69',
    dimensionId: 2
  })

  const detatchedSetDimension2 = await db.SetDimension.create({
    value: '420',
    dimensionId: 1
  })

  // const detatchedSetDimension3 = await db.SetDimension.create({
  //   value: 'nope',
  //   dimensionId: 99
  // })

  const benchSet = await db.Set.create({
    number: 1,
    reps: 10,
    exercise: 'bench press',
    setDimensions: [
      {
        value: "3",
        // dimension: reps,
        dimensionId: 1,
      },
      {
        value: "315",
        // dimension: weight,
        dimensionId: 2,
      }
    ]
  }, {
    include: [{
      association: Set.SetDimensions,
      include: [Set.SetDimensions, Dimension.SetDimension]
    }]
  });

  await sequelize.close();
})();