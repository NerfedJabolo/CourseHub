'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      if (this.associations) return;

      this.belongsTo(models.User, { as: 'teacher', foreignKey: 'teacherId' });
      this.hasMany(models.Enrollment, {
        foreignKey: 'courseId',
        as: 'enrollments',
      });
    }
  }
  Course.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      language: DataTypes.ENUM('en', 'et'),
      level: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      status: DataTypes.ENUM('draft', 'active', 'archived'),
      capacity: DataTypes.INTEGER,
      teacherId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Course',
    }
  );
  return Course;
};
