const { Model } = require('sequelize');

class SetDimension extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      value: {
        type: DataTypes.STRING
      }
    }, {
      sequelize,
      modelName: 'setDimension'
    })
  }

  static associate(models) {
    this.dimension = this.belongsTo(models.Dimension, {as: 'dimension', foreignKey: 'dimensionId'});
  }
}

module.exports = SetDimension;