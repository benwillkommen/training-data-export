const { Model } = require('sequelize');

class ExerciseDefaultDimension extends Model {
  static init(sequelize, DataTypes){
    return super.init({
      exerciseDefaultDimensionId: {
        type: DataTypes.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
        // defaultValue: DataTypes.INTEGER(11)
      },
      exerciseId: {
        type: DataTypes.INTEGER(11),
        primaryKey: false,
        references: {
          model: 'exercises',
          key: 'exerciseId'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        unique: 'uniqueDimensionPerExercise'
      },
      dimensionId: {
        type: DataTypes.INTEGER(11),
        primaryKey: false,
        references: {
          model: 'dimensions',
          key: 'dimensionId'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade',
        unique: 'uniqueDimensionPerExercise'
      }
    }, {
      sequelize,
      modelName: 'exerciseDefaultDimensions'
    })
  }

  static associate(models) {
    // this.DefaultDimensions = this.belongsToMany(models.Dimension, { as: 'defaultDimensions', through: 'exerciseDefaultDimension' });
    // TagPostGenre.belongsTo(models.Post, { foreignKey: 'post_id', targetKey: 'post_id', as: 'Post' });
    // TagPostGenre.belongsTo(models.Genre, { foreignKey: 'genre_id', targetKey: 'genre_id', as: 'Genre' });
    this.belongsTo(models.Exercise, { foreignKey: 'exerciseId', targetKey: 'exerciseId', as: 'Exercise' });
    this.belongsTo(models.Dimension, { foreignKey: 'dimensionId', targetKey: 'dimensionId', as: 'Dimension' });
  }
}

module.exports = ExerciseDefaultDimension;