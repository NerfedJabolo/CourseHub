export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: err.errors.map((e) => e.message).join(', '),
        details: err.errors,
      },
    });
  }
};
