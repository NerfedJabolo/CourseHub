import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  enrollInCourse,
  updateEnrollment,
} from '../controllers/enrollmentController.js';
import { validate } from '../middleware/validate.js';
import { updateEnrollmentSchema } from '../validators/enrollmentValidator.js';

const router = express.Router();

// Student enrolls in a course
router.post(
  '/courses/:id/enroll',
  authenticate,
  authorize('student'),
  enrollInCourse
);

// Update enrollment
router.put(
  '/:id',
  authenticate,
  authorize('student', 'teacher', 'admin'),
  validate(updateEnrollmentSchema),
  updateEnrollment
);

export default router;
