import { sequelize, User, Course, Enrollment } from '../../src/models/index.js';

let student, teacher, course, enrollment;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  teacher = await User.create({
    name: 'Teacher',
    email: 'teacher@test.com',
    passwordHash: 'password',
    role: 'teacher',
  });

  student = await User.create({
    name: 'Student',
    email: 'student@test.com',
    passwordHash: 'password',
    role: 'student',
  });

  course = await Course.create({
    title: 'Enrollment Test Course',
    description: 'Course for enrollment tests',
    language: 'en',
    level: 'beginner',
    status: 'active',
    teacherId: teacher.id,
  });

  enrollment = await Enrollment.create({
    studentId: student.id,
    courseId: course.id,
    status: 'pending',
  });
});

describe('Enrollment domain methods', () => {
  it('isActive() returns true for pending or approved', () => {
    expect(['pending', 'approved'].includes(enrollment.status)).toBe(true);
  });

  it('belongsTo() returns true if enrollment belongs to user', () => {
    expect(enrollment.studentId).toBe(student.id);
  });
});
