import { Enrollment, Course, User, sequelize } from '../models/index.js';
import { canEnroll } from '../core/course.js';
import { isActive, canCancel, approve, reject } from '../core/enrollment.js';

// POST /courses/:id/enroll  (Student)
export async function enrollInCourse(req, res) {
  try {
    const courseId = req.params.id;
    const studentId = req.user.id;

    const course = await Course.findByPk(courseId, {
      include: ['enrollmentsList'],
    });
    if (!course)
      return res.status(404).json({
        error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' },
      });

    // Use domain logic
    const check = await canEnroll(course, req.user);
    if (!check.ok) {
      let message = 'Cannot enroll';
      switch (check.reason) {
        case 'COURSE_NOT_ACTIVE':
          message = 'Cannot enroll in non-active course';
          break;
        case 'COURSE_FULL':
          message = 'Course is at full capacity';
          break;
        case 'ALREADY_ENROLLED':
          message = 'You are already enrolled in this course';
          break;
      }
      return res.status(422).json({ error: { code: check.reason, message } });
    }

    const enrollment = await Enrollment.create({
      courseId,
      studentId,
      status: 'pending',
    });
    res.status(201).json(enrollment);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: { code: 'ENROLL_FAILED', message: 'Failed to enroll' } });
  }
}

// PUT /enrollments/:id  (Teacher approve/cancel, Student cancel)
export async function updateEnrollment(req, res) {
  try {
    const enrollmentId = req.params.id;
    const { action } = req.body; // expected: "approve" or "cancel"
    const user = req.user;

    const enrollment = await Enrollment.findByPk(enrollmentId, {
      include: { model: Course, as: 'course' },
    });
    if (!enrollment)
      return res.status(404).json({
        error: {
          code: 'ENROLLMENT_NOT_FOUND',
          message: 'Enrollment not found',
        },
      });

    if (action === 'approve') {
      try {
        approve(enrollment, user);
        await enrollment.save();
        return res.json(enrollment);
      } catch (err) {
        return res
          .status(403)
          .json({ error: { code: 'FORBIDDEN', message: err.message } });
      }
    }

    if (action === 'cancel') {
      if (!canCancel(enrollment, user)) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Not authorized to cancel this enrollment',
          },
        });
      }
      reject(enrollment, user);
      await enrollment.save();
      return res.json(enrollment);
    }

    return res.status(400).json({
      error: {
        code: 'INVALID_ACTION',
        message: "Action must be 'approve' or 'cancel'",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: {
        code: 'UPDATE_ENROLLMENT_FAILED',
        message: 'Failed to update enrollment',
      },
    });
  }
}
