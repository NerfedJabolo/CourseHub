'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Enrollment extends Model {
    static associate(models) {
      if (this.associations) return;

      this.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
      this.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
    }
  }
  Enrollment.init(
    {
      courseId: DataTypes.INTEGER,
      studentId: DataTypes.INTEGER,
      status: DataTypes.ENUM('pending', 'approved', 'cancelled'),
    },
    {
      sequelize,
      modelName: 'Enrollment',
    }
  );
  return Enrollment;
};
