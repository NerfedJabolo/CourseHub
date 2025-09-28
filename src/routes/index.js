import express from 'express';
import authRoutes from './authRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);

// TODO: add /courses and /enrollments routes here

export default router;
