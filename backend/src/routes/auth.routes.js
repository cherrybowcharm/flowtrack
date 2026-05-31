const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { signupSchema, loginSchema } = require("../config/schemas");

const router = Router();

// Public routes
router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);

// Protected routes
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.me);

module.exports = router;
