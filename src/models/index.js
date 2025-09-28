// src/models/index.js
import { Sequelize } from 'sequelize';
import UserModel from './user.js';
import CourseModel from './course.js';
import EnrollmentModel from './enrollment.js';

const env = process.env.NODE_ENV || 'development';

// Initialize Sequelize
const sequelize =
  env === 'development'
    ? new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host: process.env.DB_HOST || 'localhost',
          dialect: 'postgres', // or mysql, sqlite, etc.
          logging: console.log, // enable logging in dev
        }
      )
    : new Sequelize({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false,
      });

// Import models
const User = UserModel(sequelize);
const Course = CourseModel(sequelize);
const Enrollment = EnrollmentModel(sequelize);

// Associations
User.hasMany(Course, { foreignKey: 'teacherId', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

User.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: 'studentId',
  otherKey: 'courseId',
  as: 'enrollments',
});
Course.belongsToMany(User, {
  through: Enrollment,
  foreignKey: 'courseId',
  otherKey: 'studentId',
  as: 'students',
});

Enrollment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

User.hasMany(Enrollment, { foreignKey: 'studentId', as: 'enrollmentsList' });
Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollmentsList' });

export { sequelize, User, Course, Enrollment };
