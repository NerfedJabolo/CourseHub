import { Enrollment } from '../models/index.js';

export async function canEnroll(course, user) {
  if (!course) throw new Error('Course not found');

  // Course must be active
  if (course.status !== 'active')
    return { ok: false, reason: 'COURSE_NOT_ACTIVE' };

  // Check capacity
  if (course.capacity) {
    const approvedCount = await Enrollment.count({
      where: { courseId: course.id, status: 'approved' },
    });
    if (approvedCount >= course.capacity)
      return { ok: false, reason: 'COURSE_FULL' };
  }

  // Check if student already has an active enrollment
  const existing = await Enrollment.findOne({
    where: {
      courseId: course.id,
      studentId: user.id,
      status: ['pending', 'approved'],
    },
  });
  if (existing) return { ok: false, reason: 'ALREADY_ENROLLED' };

  return { ok: true };
}

export async function applyDeletePolicy(course, transaction = null) {
  if (!course) throw new Error('Course not found');

  // Transaction-aware update
  await Enrollment.update(
    { status: 'cancelled' },
    { where: { courseId: course.id }, transaction }
  );
}

export function isOwner(course, user) {
  return user.role === 'teacher' && course.teacherId === user.id;
}

export function canEdit(course, user) {
  return user.role === 'admin' || isOwner(course, user);
}
