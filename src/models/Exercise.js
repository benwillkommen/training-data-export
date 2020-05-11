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
    this.associations.defaultDimensions = this.belongsToMany(models.Dimension, { as: 'defaultDimensions', through: models.ExerciseDefaultDimension, foreignKey: 'exerciseId'});    
  }
}

module.exports = Exercise;