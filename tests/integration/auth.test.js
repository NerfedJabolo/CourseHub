import request from 'supertest';
import app from '../../src/app.js';
import { sequelize, User } from '../../src/models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

let testUser;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  testUser = {
    name: 'Test User',
    email: 'testuser@test.com',
    password: 'password', // plain password
    role: 'student',
  };
});

describe('Auth API', () => {
  it('should register user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.email).toBe(testUser.email);
  });

  it('should not allow duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.statusCode).toBe(400); // validation/duplicate handled
  });

  it('should login with valid credentials', async () => {
    // Make sure user exists with hashed password
    const existingUser = await User.findOne({
      where: { email: testUser.email },
    });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await User.create({ ...testUser, passwordHash: hashedPassword });
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    console.log(res.body);
    expect(res.body).toHaveProperty('token');
  });
});
