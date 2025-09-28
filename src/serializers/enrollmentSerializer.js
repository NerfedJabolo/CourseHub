import { serializeUser } from './userSerializer.js';
import { serializeCourse } from './courseSerializer.js';

export const serializeEnrollment = (enrollment) => {
  return {
    id: enrollment.id,
    status: enrollment.status,
    student: enrollment.student ? serializeUser(enrollment.student) : null,
    course: enrollment.course ? serializeCourse(enrollment.course) : null,
    createdAt: enrollment.createdAt,
    updatedAt: enrollment.updatedAt,
  };
};
