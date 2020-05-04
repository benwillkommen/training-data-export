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

  // static associate(models) {
  //   this.Dimension = this.hasOne(models.Dimension);
  // }
}

module.exports = SetDimension;