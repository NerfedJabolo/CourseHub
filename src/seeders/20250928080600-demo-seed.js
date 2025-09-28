'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords
    const password = await bcrypt.hash('password123', 10);

    // Users
    const [
      adminId,
      teacher1Id,
      teacher2Id,
      student1Id,
      student2Id,
      student3Id,
    ] = await Promise.all([
      queryInterface
        .bulkInsert(
          'Users',
          [
            {
              name: 'Admin User',
              email: 'admin@example.com',
              passwordHash: password,
              role: 'admin',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { returning: ['id'] }
        )
        .then((r) => r[0].id),

      queryInterface
        .bulkInsert(
          'Users',
          [
            {
              name: 'Teacher One',
              email: 'teacher1@example.com',
              passwordHash: password,
              role: 'teacher',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { returning: ['id'] }
        )
        .then((r) => r[0].id),

      queryInterface
        .bulkInsert(
          'Users',
          [
            {
              name: 'Teacher Two',
              email: 'teacher2@example.com',
              passwordHash: password,
              role: 'teacher',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { returning: ['id'] }
        )
        .then((r) => r[0].id),

      queryInterface
        .bulkInsert(
          'Users',
          [
            {
              name: 'Student One',
              email: 'student1@example.com',
              passwordHash: password,
              role: 'student',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { returning: ['id'] }
        )
        .then((r) => r[0].id),

      queryInterface
        .bulkInsert(
          'Users',
          [
            {
              name: 'Student Two',
              email: 'student2@example.com',
              passwordHash: password,
              role: 'student',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { returning: ['id'] }
        )
        .then((r) => r[0].id),

      queryInterface
        .bulkInsert(
          'Users',
          [
            {
              name: 'Student Three',
              email: 'student3@example.com',
              passwordHash: password,
              role: 'student',
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { returning: ['id'] }
        )
        .then((r) => r[0].id),
    ]);

    // Courses
    const [course1Id, course2Id] = await Promise.all([
      queryInterface
        .bulkInsert(
          'Courses',
          [
            {
              title: 'Intro to Programming',
              description: 'Learn programming basics.',
              language: 'en',
              level: 'beginner',
              status: 'active',
              capacity: 2,
              teacherId: teacher1Id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { returning: ['id'] }
        )
        .then((r) => r[0].id),

      queryInterface
        .bulkInsert(
          'Courses',
          [
            {
              title: 'Advanced Databases',
              description: 'Dive into database systems.',
              language: 'en',
              level: 'advanced',
              status: 'draft',
              capacity: null,
              teacherId: teacher2Id,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          { returning: ['id'] }
        )
        .then((r) => r[0].id),
    ]);

    // Enrollments
    await queryInterface.bulkInsert('Enrollments', [
      {
        courseId: course1Id,
        studentId: student1Id,
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        courseId: course1Id,
        studentId: student2Id,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        courseId: course2Id,
        studentId: student3Id,
        status: 'cancelled',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Enrollments', null, {});
    await queryInterface.bulkDelete('Courses', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};
