const { Model } = require('sequelize');

class Dimension extends Model {
  static init(sequelize, DataTypes){
    return super.init({
      name: {
        type: DataTypes.STRING
      },
      type: {
        type: DataTypes.STRING
      }
    }, {
      sequelize,
      modelName: 'dimension'
    })
  }

  static associate(models) {
    this.SetDimension = this.hasMany(models.SetDimension);
  }
}

module.exports = Dimension;