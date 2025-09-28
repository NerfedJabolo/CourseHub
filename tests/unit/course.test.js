import { sequelize, User, Course, Enrollment } from '../../src/models/index.js';

let teacher, student;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  teacher = await User.create({
    name: 'Teacher',
    email: 'teacher@test.com',
    passwordHash: 'password',
    role: 'teacher',
  });

  student = await User.create({
    name: 'Student',
    email: 'student@test.com',
    passwordHash: 'password',
    role: 'student',
  });
});

describe('Course Model', () => {
  it('creates a course correctly', async () => {
    const course = await Course.create({
      title: 'Unit Test Course',
      description: 'A unit test course',
      language: 'en',
      level: 'beginner',
      status: 'active',
      capacity: 2,
      teacherId: teacher.id,
    });

    expect(course.title).toBe('Unit Test Course');
    expect(course.teacherId).toBe(teacher.id);
  });

  describe('canEnroll()', () => {
    it('returns false if course is not active', async () => {
      const course = await Course.create({
        title: 'Inactive Course',
        status: 'draft',
        capacity: 2,
        teacherId: teacher.id,
      });

      expect(await course.canEnroll(student)).toBe(false);
    });

    it('returns false if capacity is exceeded', async () => {
      const course = await Course.create({
        title: 'Full Course',
        status: 'active',
        capacity: 2,
        teacherId: teacher.id,
      });

      const student2 = await User.create({
        name: 'Student 2',
        email: 'student2@test.com',
        passwordHash: 'password',
        role: 'student',
      });

      await Enrollment.bulkCreate([
        { courseId: course.id, studentId: student.id, status: 'approved' },
        { courseId: course.id, studentId: student2.id, status: 'approved' },
      ]);

      expect(await course.canEnroll(student)).toBe(false);
    });

    it('returns true if active and under capacity', async () => {
      const course = await Course.create({
        title: 'Open Course',
        status: 'active',
        capacity: 5,
        teacherId: teacher.id,
      });

      expect(await course.canEnroll(student)).toBe(true);
    });
  });

  describe('applyDeletePolicy()', () => {
    it('cancels all enrollments when course is deleted', async () => {
      const courseToDelete = await Course.create({
        title: 'Delete Me',
        status: 'active',
        teacherId: teacher.id,
      });

      const enrollment = await Enrollment.create({
        courseId: courseToDelete.id,
        studentId: student.id,
        status: 'approved',
      });

      await courseToDelete.applyDeletePolicy();

      await enrollment.reload();
      expect(enrollment.status).toBe('cancelled');
    });
  });
});
