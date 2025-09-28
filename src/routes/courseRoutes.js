import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';

const router = express.Router();

// Anyone logged in can read courses
router.get('/', authenticate, getCourses);

// Only teacher/admin can create
router.post('/', authenticate, authorize('teacher', 'admin'), createCourse);

// Update course: admin or owner
router.put('/:id', authenticate, authorize('teacher', 'admin'), updateCourse);

// Delete course: admin or owner
router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'admin'),
  deleteCourse
);

export default router;
