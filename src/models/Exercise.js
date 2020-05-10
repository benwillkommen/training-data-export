const { Model } = require('sequelize');

class Exercise extends Model {
  static init(sequelize, DataTypes){
    return super.init({
      exerciseId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: { type: DataTypes.STRING, unique: true }
    }, {
      sequelize,
      modelName: 'exercise'
    })
  }

  static associate(models) {
    // this.DefaultDimensions = this.belongsToMany(models.Dimension, { as: 'defaultDimensions', through: 'exerciseDefaultDimension' });
    // Genre.belongsToMany(models.Post, { as: 'PostsInGenre', through: models.TagPostGenre, foreignKey: 'genre_id'});

    this.associations.defaultDimensions = this.belongsToMany(models.Dimension, { as: 'defaultDimensions', through: models.ExerciseDefaultDimension, foreignKey: 'exerciseId'});
  }
}

module.exports = Exercise;