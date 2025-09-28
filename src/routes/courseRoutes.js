import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { validate } from '../middleware/validate.js';
import {
  createCourseSchema,
  updateCourseSchema,
} from '../validators/courseValidator.js';

const router = express.Router();

router.get('/', authenticate, getCourses);

router.post(
  '/',
  authenticate,
  authorize('teacher', 'admin'),
  validate(createCourseSchema),
  createCourse
);

router.put(
  '/:id',
  authenticate,
  authorize('teacher', 'admin'),
  validate(updateCourseSchema),
  updateCourse
);

router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'admin'),
  deleteCourse
);

export default router;
