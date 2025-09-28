import request from 'supertest';
import app from '../../src/app.js';
import { sequelize, User, Course, Enrollment } from '../../src/models/index.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

let admin, teacher, student, course;
let adminToken, teacherToken, studentToken;
let enrollmentId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Seed users
  admin = await User.create({
    name: 'Admin',
    email: 'admin@test.com',
    passwordHash: 'password',
    role: 'admin',
  });
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

  // Seed course
  course = await Course.create({
    title: 'Test Course',
    description: 'A course',
    language: 'en',
    level: 'beginner',
    status: 'active',
    teacherId: teacher.id,
  });

  // JWT tokens
  adminToken = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET);
  teacherToken = jwt.sign({ id: teacher.id, role: teacher.role }, JWT_SECRET);
  studentToken = jwt.sign({ id: student.id, role: student.role }, JWT_SECRET);
});

describe('Enrollments API', () => {
  it('student can enroll in course', async () => {
    const res = await request(app)
      .post(`/api/enrollments/courses/${course.id}/enroll`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.status).toBe('pending');

    enrollmentId = res.body.data.id;
  });

  it('teacher can approve enrollment', async () => {
    const res = await request(app)
      .put(`/api/enrollments/${enrollmentId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ action: 'approve' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('approved');
  });

  it('student can cancel their enrollment', async () => {
    const res = await request(app)
      .put(`/api/enrollments/${enrollmentId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ action: 'cancel' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
  });
});
