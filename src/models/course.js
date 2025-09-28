import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Course extends Model {
    static associate(models) {
      if (this.associations) return;

      this.belongsTo(models.User, { as: 'teacher', foreignKey: 'teacherId' });
      this.hasMany(models.Enrollment, {
        foreignKey: 'courseId',
        as: 'enrollments',
      });
    }
    async canEnroll(student) {
      if (this.status !== 'active') return false;

      const { Enrollment } = this.sequelize.models;

      // Check capacity
      if (this.capacity !== null && this.capacity !== undefined) {
        const approvedCount = await Enrollment.count({
          where: { courseId: this.id, status: 'approved' },
        });
        if (approvedCount >= this.capacity) return false;
      }

      // Check if this student is already enrolled
      if (student) {
        const alreadyEnrolled = await Enrollment.findOne({
          where: {
            courseId: this.id,
            studentId: student.id,
            status: 'approved',
          },
        });
        if (alreadyEnrolled) return false;
      }

      return true;
    }

    async applyDeletePolicy() {
      if (!this.Enrollments)
        await this.reload({ include: ['enrollmentsList'] });
      for (const e of this.enrollmentsList) {
        e.status = 'cancelled';
        await e.save();
      }
    }
  }
  Course.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      language: DataTypes.ENUM('en', 'et'),
      level: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      status: DataTypes.ENUM('draft', 'active', 'archived'),
      capacity: DataTypes.INTEGER,
      teacherId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'Course',
    }
  );
  return Course;
};
