const Sequelize = require('sequelize');

const {
  DB_USER,
  DB_PASSWORD,
  DB_INITIAL
} = process.env;

(async() => {
  const sequelize = new Sequelize(DB_INITIAL, DB_USER, DB_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
  });

  const Model = Sequelize.Model;
  class Set extends Model {}
  Set.init({
    // attributes
    number: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    exercise: {
      type: Sequelize.STRING
      // allowNull defaults to true
    },
    date: {
      type: Sequelize.DATE()
    }
  }, {
    sequelize,
    modelName: 'set'
    // options
  });

  class SetDimension extends Model {}
  SetDimension.init({
    value: {
      type: Sequelize.STRING
    }
  }, {
    sequelize,
    modelName: 'setDimension'
  });

  Set.hasMany(SetDimension)

  class Dimension extends Model {}
  Dimension.init({
    name: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING
    }
  }, {
    sequelize,
    modelName: 'dimension'
  });

  SetDimension.hasOne(Dimension)
  // class Exercise extends Model {}
  // Exercise.init({
  //   name: {
  //     type: Sequelize.STRING,
  //     allowNull: false
  //   },
  //   defaultDimensions: {

  //   }
  // });

  // class Dimension extends Model {}
  // Dimension.init({

  // });

  // class Unit extends Model {}
  // Unit.init({
  // })
  await sequelize.sync({force: true})

  // const benchSet = await Set.create({number: 1, reps: 10, exercise: 'bench press'});
  await sequelize.close();
})();