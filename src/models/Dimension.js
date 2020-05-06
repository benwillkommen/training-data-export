const { Model } = require('sequelize');

class Dimension extends Model {
  static init(sequelize, DataTypes){
    return super.init({
      name: { type: DataTypes.STRING, unique: true },
      type: { type: DataTypes.STRING }
    }, {
      sequelize,
      modelName: 'dimension'
    })
  }

  static associate(models) {
    this.SetDimension = this.hasMany(models.SetDimension);
    // this.DefaultDimensions = this.belongsToMany(models.Exercise, { as: 'defaultDimensions' });

  }
}

module.exports = Dimension;