import express from 'express';
import authRoutes from './authRoutes.js';
import courseRoutes from './courseRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);

// TODO: add /enrollments routes here

export default router;
