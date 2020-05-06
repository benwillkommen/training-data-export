const { Model } = require('sequelize');

class Exercise extends Model {
  static init(sequelize, DataTypes){
    return super.init({
      name: { type: DataTypes.STRING, unique: true }
    }, {
      sequelize,
      modelName: 'exercise'
    })
  }

  static associate(models) {
    this.DefaultDimensions = this.belongsToMany(models.Dimension, { as: 'defaultDimensions', through: 'exerciseDefaultDimension' });
  }
}

module.exports = Exercise;