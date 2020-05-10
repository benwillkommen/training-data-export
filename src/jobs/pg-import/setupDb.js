const Sequelize = require('sequelize');

const {
  DB_USER,
  DB_PASSWORD,
  DB_INITIAL
} = process.env;

const Set = require('../../models/Set');
const SetDimension = require('../../models/SetDimension');
const Dimension = require('../../models/Dimension');
const Exercise = require('../../models/Exercise');
const ExerciseDefaultDimension = require('../../models/ExerciseDefaultDimension');

module.exports = async function () {
  const sequelize = new Sequelize(DB_INITIAL, DB_USER, DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
  });

  // https://codewithhugo.com/using-es6-classes-for-sequelize-4-models/
  const models = {
    Set: Set.init(sequelize, Sequelize),
    SetDimension: SetDimension.init(sequelize, Sequelize),
    Dimension: Dimension.init(sequelize, Sequelize),
    Exercise: Exercise.init(sequelize, Sequelize),
    ExerciseDefaultDimension: ExerciseDefaultDimension.init(sequelize, Sequelize)
  }

  // Run `.associate` if it exists,
  // ie create relationships in the ORM
  Object.values(models)
    .filter(model => typeof model.associate === "function")
    .forEach(model => model.associate(models));

  try {
    await sequelize.sync({ force: true });
  } catch (ex) {
    throw ex;
  }

  return {
    ...models,
    sequelize
  }
}