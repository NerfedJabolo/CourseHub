// src/models/index.js
import { Sequelize } from 'sequelize';
import config from '../config/database.js';
import UserModel from './user.js';
import CourseModel from './course.js';
import EnrollmentModel from './enrollment.js';

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize =
  env === 'production'
    ? new Sequelize(dbConfig.url, { dialect: 'postgres', logging: false })
    : new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
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
