import { serializeUser } from './userSerializer.js';

export const serializeCourse = (course) => {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    language: course.language,
    level: course.level,
    status: course.status,
    capacity: course.capacity,
    teacher: course.teacher ? serializeUser(course.teacher) : null,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
};
