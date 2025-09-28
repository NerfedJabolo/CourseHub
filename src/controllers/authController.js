import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  BCRYPT_SALT_ROUNDS,
} from '../config/auth.js';

// POST /auth/register
export async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;

    // check if user exists
    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({
        error: { code: 'USER_EXISTS', message: 'Email already in use' },
      });

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({ name, email, passwordHash, role });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: { code: 'REG_FAILED', message: 'Registration failed' } });
  }
}

// POST /auth/login
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({ token });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: { code: 'LOGIN_FAILED', message: 'Login failed' } });
  }
}
