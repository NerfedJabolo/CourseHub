import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res
      .status(401)
      .json({ error: { code: 'NO_TOKEN', message: 'No token provided' } });

  const token = authHeader.split(' ')[1];
  if (!token)
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN_FORMAT',
        message: 'Invalid token format',
      },
    });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({
      error: { code: 'TOKEN_INVALID', message: 'Token invalid or expired' },
    });
  }
}
