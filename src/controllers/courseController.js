import { Course, User, Enrollment } from '../models/index.js';
import { Op } from 'sequelize';

// GET /courses?query params
export async function getCourses(req, res) {
  try {
    const {
      q,
      language,
      level,
      status,
      teacherId,
      page = 1,
      limit = 10,
    } = req.query;

    const where = {};
    if (q) where.title = { [Op.iLike]: `%${q}%` };
    if (language) where.language = language;
    if (level) where.level = level;
    if (status) where.status = status;
    if (teacherId) where.teacherId = teacherId;

    const offset = (page - 1) * limit;

    const courses = await Course.findAndCountAll({
      where,
      include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      total: courses.count,
      page: parseInt(page),
      limit: parseInt(limit),
      data: courses.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: { code: 'GET_COURSES_FAILED', message: 'Failed to get courses' },
    });
  }
}

// POST /courses
export async function createCourse(req, res) {
  try {
    const { title, description, language, level, status, capacity } = req.body;
    const teacherId = req.user.id;

    // ensure unique title per teacher
    const existing = await Course.findOne({ where: { title, teacherId } });
    if (existing)
      return res.status(409).json({
        error: {
          code: 'TITLE_EXISTS',
          message: 'You already have a course with this title',
        },
      });

    const course = await Course.create({
      title,
      description,
      language,
      level,
      status,
      capacity,
      teacherId,
    });

    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: {
        code: 'CREATE_COURSE_FAILED',
        message: 'Failed to create course',
      },
    });
  }
}

// PUT /courses/:id
export async function updateCourse(req, res) {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Course not found' } });

    // Only admin or owning teacher can update
    if (req.user.role !== 'admin' && req.user.id !== course.teacherId) {
      return res
        .status(403)
        .json({ error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    const updates = req.body;
    await course.update(updates);

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: {
        code: 'UPDATE_COURSE_FAILED',
        message: 'Failed to update course',
      },
    });
  }
}

// DELETE /courses/:id
export async function deleteCourse(req, res) {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [{ model: Enrollment, as: 'enrollmentsList' }],
    });
    if (!course)
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Course not found' } });

    // Only admin or owning teacher can delete
    if (req.user.role !== 'admin' && req.user.id !== course.teacherId) {
      return res
        .status(403)
        .json({ error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    // Transaction: mark enrollments cancelled instead of deleting
    await course.sequelize.transaction(async (t) => {
      await Enrollment.update(
        { status: 'cancelled' },
        { where: { courseId: course.id }, transaction: t }
      );
      await course.destroy({ transaction: t });
    });

    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: {
        code: 'DELETE_COURSE_FAILED',
        message: 'Failed to delete course',
      },
    });
  }
}
