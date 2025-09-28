'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Courses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      language: {
        type: Sequelize.ENUM('en', 'et'),
        allowNull: false,
      },
      level: {
        type: Sequelize.ENUM('beginner', 'intermediate', 'advanced'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'archived'),
        allowNull: false,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      teacherId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // unique constraint (title, teacherId)
    await queryInterface.addConstraint('Courses', {
      fields: ['title', 'teacherId'],
      type: 'unique',
      name: 'unique_course_per_teacher',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Courses');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Courses_language";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Courses_level";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Courses_status";'
    );
  },
};
