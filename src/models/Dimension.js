const { Model } = require('sequelize');

class Dimension extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      dimensionId: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      name: { type: DataTypes.STRING, unique: true },
      type: { type: DataTypes.STRING }
    }, {
      sequelize,
      modelName: 'dimension'
    })
  }

  static associate(models) {
    this.SetDimension = this.hasMany(models.SetDimension);
    // this.DefaultDimensions = this.belongsToMany(models.Exercise, { as: 'defaultForExercises', through: 'exerciseDefaultDimension' });
    this.belongsToMany(models.Exercise, { as: 'DefaultDimensionForExercise', through: models.ExerciseDefaultDimension, foreignKey: 'dimensionId'});


  }
}

module.exports = Dimension;