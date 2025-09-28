import { Model, DataTypes } from 'sequelize';
import jwt from 'jsonwebtoken';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      if (this.associations) return;

      this.hasMany(models.Course, { foreignKey: 'teacherId', as: 'courses' });
      this.hasMany(models.Enrollment, {
        foreignKey: 'studentId',
        as: 'enrollments',
      });
    }
  }
  User.prototype.generateJWT = function () {
    return jwt.sign(
      { id: this.id, role: this.role },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
  };
  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('admin', 'teacher', 'student'),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
