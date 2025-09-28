/**
 * Returns true if the enrollment is active (pending or approved)
 */
export function isActive(enrollment) {
  return ['pending', 'approved'].includes(enrollment.status);
}

/**
 * Returns true if the given user can cancel this enrollment
 * - Student can cancel their own enrollment
 * - Teacher can cancel enrollments for their courses
 * - Admin can cancel any enrollment
 */
export function canCancel(enrollment, user) {
  if (user.role === 'admin') return true;
  if (user.role === 'student' && enrollment.studentId === user.id) return true;
  if (user.role === 'teacher' && enrollment.course.teacherId === user.id)
    return true;
  return false;
}

/**
 * Approve this enrollment
 * - Only Teacher (owner of course) or Admin can approve
 * - Enrollment must be pending
 */
export function approve(enrollment, user) {
  if (enrollment.status !== 'pending')
    throw new Error('Enrollment not pending');
  if (user.role === 'admin') {
    enrollment.status = 'approved';
    return;
  }
  if (user.role === 'teacher' && enrollment.course.teacherId === user.id) {
    enrollment.status = 'approved';
    return;
  }
  throw new Error('Not authorized to approve');
}

/**
 * Reject or cancel this enrollment
 * - Can be canceled by Student (own) or Teacher/Admin (depending on ownership)
 */
export function reject(enrollment, user) {
  if (!canCancel(enrollment, user)) throw new Error('Not authorized to cancel');
  enrollment.status = 'cancelled';
}

/**
 * Helper: returns true if this enrollment belongs to a specific user
 */
export function belongsTo(enrollment, user) {
  return enrollment.studentId === user.id;
}
