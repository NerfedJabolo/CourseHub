import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Enrollment extends Model {
    static associate(models) {
      if (this.associations) return;

      this.belongsTo(models.Course, { foreignKey: 'courseId', as: 'course' });
      this.belongsTo(models.User, { foreignKey: 'studentId', as: 'student' });
    }
  }
  Enrollment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      courseId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'Enrollment',
      tableName: 'Enrollments',
      timestamps: true,
    }
  );
  return Enrollment;
};
