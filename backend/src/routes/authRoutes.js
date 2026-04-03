const express = require("express");
const { body } = require("express-validator");
const { login, me, register } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  login
);

router.get("/me", requireAuth, me);

module.exports = router;
