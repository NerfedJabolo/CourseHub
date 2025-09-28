// src/middleware/validate.js
export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    const messages = Array.isArray(err?.errors)
      ? err.errors.map((e) => e.message).join(', ')
      : err.message || 'Validation failed';

    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: messages,
        details: err.errors || [],
      },
    });
  }
};
