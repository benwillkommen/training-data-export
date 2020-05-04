const { Model } = require('sequelize');

class Set extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      // attributes
      number: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      exercise: {
        type: DataTypes.STRING
        // allowNull defaults to true
      },
      logDate: {
        type: DataTypes.DATE()
      }
    }, {
      sequelize,
      modelName: 'set'
      // options
    })
  }

  static associate(models) {
    this.SetDimensions = this.hasMany(models.SetDimension);
  }
}

module.exports = Set;