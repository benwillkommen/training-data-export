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

  // const sequelize = new Sequelize('postgres://postgres:example@localhost:5432');


  await sequelize.authenticate()
    // .then(() => {
    //   console.log('Connection has been established successfully.');
    // })
    // .catch(err => {
    //   console.error('Unable to connect to the database:', err);
    // });

  const Model = Sequelize.Model;
  class Set extends Model {}
  Set.init({
    // attributes
    number: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    reps: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    exercise: {
      type: Sequelize.STRING
      // allowNull defaults to true
    }
  }, {
    sequelize,
    modelName: 'set'
    // options
  });

  await sequelize.sync({force: true})

  await sequelize.close();
})();