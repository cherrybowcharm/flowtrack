const { ZodError } = require("zod");
const AppError = require("../utils/AppError");

/**
 * Factory that returns an Express middleware which validates req.body
 * against the provided Zod schema.
 *
 * Usage: router.post('/signup', validate(signupSchema), authController.signup)
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      // Parse and replace req.body with the validated + coerced data
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        return next(new AppError(`Validation error — ${messages}`, 400));
      }
      next(error);
    }
  };
}

/**
 * Validate query parameters against a Zod schema.
 * Replaces req.query with the coerced result.
 */
function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        return next(new AppError(`Invalid query parameters — ${messages}`, 400));
      }
      next(error);
    }
  };
}

module.exports = { validate, validateQuery };
