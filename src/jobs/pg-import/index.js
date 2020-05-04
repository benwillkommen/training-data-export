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

const schemaSketch = require('../../models/schemaSketch');

(async() => {
  const sequelize = new Sequelize(DB_INITIAL, DB_USER, DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
  });

  // https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
  const models = {
    Set: Set.init(sequelize, Sequelize),
    SetDimension: SetDimension.init(sequelize, Sequelize),
    Dimension: Dimension.init(sequelize, Sequelize),
  }

  // Run `.associate` if it exists,
  // ie create relationships in the ORM
  Object.values(models)
    .filter(model => typeof model.associate === "function")
    .forEach(model => model.associate(models));

  await sequelize.sync({force: true});

  const db = {
    ...models,
    sequelize
  }

  for (const dimension of schemaSketch.dimensions) {
    await db.Dimension.create({
      name: dimension.name,
      type: dimension.type
    })
  }
  
  const defaultDimensions = await db.Dimension.findAll({
    where: {
      [Op.or]: [{name: "reps"}, {name: "weight (lbs)"}]
    }
  });
  const reps = defaultDimensions.filter(d => d.name === 'reps')[0]
  const weight = defaultDimensions.filter(d => d.name === 'weight (lbs)')[0]

  // for (const exercise of schemaSketch.exercises) {
  //   await db.exercise.create({
  //     name: exercise.name,

  //   })
  // }

  const benchSet = await db.Set.create({
    number: 1, 
    reps: 10,
    exercise: 'bench press',
    setDimensions: [
      { 
        value: "3",
        // dimension: reps,
        dimension: 1,
      },
      {
        value: "315",
        // dimension: weight,
        dimension: 2,
      }
    ]
  }, {
    include: [{
      association: Dimension.SetDimension,
      include: [ Set.SetDimensions ]
    }]
  });

  await sequelize.close();
})();