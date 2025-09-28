import request from 'supertest';
import app from '../../src/app.js';
import { sequelize, User, Course } from '../../src/models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

let teacher, student, teacherToken, studentToken, course;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create teacher and student with hashed passwords
  teacher = await User.create({
    name: 'Teacher',
    email: 'teacher@test.com',
    passwordHash: await bcrypt.hash('password', 10),
    role: 'teacher',
  });

  student = await User.create({
    name: 'Student',
    email: 'student@test.com',
    passwordHash: await bcrypt.hash('password', 10),
    role: 'student',
  });

  teacherToken = jwt.sign({ id: teacher.id, role: teacher.role }, JWT_SECRET);
  studentToken = jwt.sign({ id: student.id, role: student.role }, JWT_SECRET);

  course = await Course.create({
    title: 'Existing Course',
    description: 'Already created',
    language: 'en',
    level: 'beginner',
    status: 'active',
    teacherId: teacher.id,
  });
});

describe('Courses API', () => {
  it('student can read courses', async () => {
    const res = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true); // make sure data is an array
  });

  it('teacher can create a course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Test Course',
        description: 'A course',
        language: 'en',
        level: 'beginner',
        status: 'active',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('title', 'Test Course');
    expect(res.body).toHaveProperty('teacherId', teacher.id);
  });

  it('student cannot create a course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Invalid Course',
        description: 'Should fail',
        language: 'en',
        level: 'beginner',
        status: 'active',
      });

    expect(res.statusCode).toBe(403);
  });
});
