// src/controllers/enrollmentController.js
import { Enrollment, Course, sequelize } from '../models/index.js';
import { canEnroll } from '../core/course.js';
import {
  approve as enrollmentApprove,
  reject as enrollmentReject,
} from '../core/enrollment.js';

/**
 * POST /courses/:id/enroll
 * Student enrolls in a course -> creates a pending enrollment.
 */
export async function enrollInCourse(req, res) {
  try {
    const courseId = Number(req.params.id);
    const studentId = req.user.id;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        error: { code: 'COURSE_NOT_FOUND', message: 'Course not found' },
      });
    }

    // Use domain logic
    const check = await canEnroll(course, req.user);
    if (!check.ok) {
      const reasonToStatus = {
        COURSE_NOT_ACTIVE: {
          status: 422,
          message: 'Cannot enroll in non-active course',
        },
        COURSE_FULL: { status: 409, message: 'Course is full' },
        ALREADY_ENROLLED: { status: 409, message: 'Already enrolled' },
      };
      const r = reasonToStatus[check.reason] || {
        status: 422,
        message: 'Cannot enroll',
      };
      return res
        .status(r.status)
        .json({ error: { code: check.reason, message: r.message } });
    }

    // Create pending enrollment. Unique index (courseId, studentId) should prevent duplicates.
    let enrollment;
    try {
      enrollment = await Enrollment.create({
        courseId,
        studentId,
        status: 'pending',
      });
    } catch (err) {
      // handle unique index violation if concurrently inserted by another request
      console.error('Enroll create error:', err);
      return res.status(409).json({
        error: { code: 'ALREADY_ENROLLED', message: 'Already enrolled' },
      });
    }

    return res.status(201).json({ data: enrollment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: {
        code: 'ENROLL_FAILED',
        message: 'Failed to enroll',
        details: err.message,
      },
    });
  }
}

/**
 * PUT /enrollments/:id
 * Body: { action: "approve" | "cancel" }
 *
 * Roles:
 *  - Student: may cancel their own enrollment (action === 'cancel')
 *  - Teacher: may approve or cancel enrollments belonging to THEIR course
 *  - Admin: may approve or cancel any enrollment
 */
export async function updateEnrollment(req, res) {
  try {
    const enrollmentId = Number(req.params.id);
    const action = (req.body.action || '').toString();
    const user = req.user;

    if (!['approve', 'cancel'].includes(action)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ACTION',
          message: "action must be 'approve' or 'cancel'",
        },
      });
    }

    // Load enrollment and its course (we need course.teacherId and course.id)
    const enrollment = await Enrollment.findByPk(enrollmentId, {
      include: { model: Course, as: 'course' },
    });

    if (!enrollment) {
      return res.status(404).json({
        error: {
          code: 'ENROLLMENT_NOT_FOUND',
          message: 'Enrollment not found',
        },
      });
    }

    // Student cancel flow
    if (user.role === 'student') {
      if (action !== 'cancel') {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Students may only cancel their own enrollments',
          },
        });
      }
      if (enrollment.studentId !== user.id) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: "Cannot cancel another student's enrollment",
          },
        });
      }

      // use domain reject/cancel
      try {
        enrollmentReject(enrollment, user); // sets status = "cancelled"
        await enrollment.save();
        return res.json({ data: enrollment });
      } catch (err) {
        console.error(err);
        return res
          .status(403)
          .json({ error: { code: 'FORBIDDEN', message: err.message } });
      }
    }

    // Teacher or Admin flows (approve/cancel)
    if (user.role === 'teacher' || user.role === 'admin') {
      // teacher must own the course to operate
      if (user.role === 'teacher' && enrollment.course.teacherId !== user.id) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: "Cannot manage enrollments for courses you don't own",
          },
        });
      }

      if (action === 'cancel') {
        // cancel by teacher/admin
        try {
          enrollmentReject(enrollment, user); // sets status = "cancelled"
          await enrollment.save();
          return res.json({ data: enrollment });
        } catch (err) {
          console.error(err);
          return res
            .status(403)
            .json({ error: { code: 'FORBIDDEN', message: err.message } });
        }
      }

      if (action === 'approve') {
        return await sequelize
          .transaction(async (t) => {
            // reload enrollment
            await enrollment.reload({ transaction: t });

            if (enrollment.status !== 'pending') {
              return res.status(409).json({
                error: {
                  code: 'INVALID_ENROLLMENT_STATUS',
                  message: 'Only pending enrollments can be approved',
                },
              });
            }

            // fetch course without lock
            const course = await Course.findByPk(enrollment.courseId, {
              transaction: t,
            });
            if (!course) {
              return res.status(404).json({
                error: {
                  code: 'COURSE_NOT_FOUND',
                  message: 'Course not found',
                },
              });
            }

            if (course.status !== 'active') {
              return res.status(422).json({
                error: {
                  code: 'COURSE_NOT_ACTIVE',
                  message: 'Cannot approve enrollment for non-active course',
                },
              });
            }

            // check capacity
            if (course.capacity) {
              const approvedCount = await Enrollment.count({
                where: { courseId: course.id, status: 'approved' },
                transaction: t,
              });

              if (approvedCount >= course.capacity) {
                return res.status(409).json({
                  error: {
                    code: 'COURSE_FULL',
                    message: 'Course capacity reached',
                  },
                });
              }
            }

            // apply approval
            enrollment.status = 'approved';
            await enrollment.save({ transaction: t });

            return res.json({ data: enrollment });
          })
          .catch((err) => {
            console.error('Approval transaction error:', err);
            if (!res.headersSent) {
              return res.status(500).json({
                error: {
                  code: 'APPROVAL_FAILED',
                  message: 'Failed to approve enrollment',
                  details: err.message,
                },
              });
            }
          });
      }
    }

    // If we reach here, role not supported
    return res
      .status(403)
      .json({ error: { code: 'FORBIDDEN', message: 'Not authorized' } });
  } catch (err) {
    console.error('updateEnrollment error:', err);
    // If earlier code already sent a response inside transaction, ignore
    if (!res.headersSent) {
      return res.status(500).json({
        error: {
          code: 'UPDATE_ENROLLMENT_FAILED',
          message: 'Failed to update enrollment',
          details: err.message,
        },
      });
    }
  }
}
