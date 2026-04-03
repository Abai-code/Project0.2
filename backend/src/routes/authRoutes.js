const express = require("express");
const { body } = require("express-validator");
const { login, me, register } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("username").trim().isLength({ min: 3 }).withMessage("Минимум 3 символа"),
    body("email").isEmail().withMessage("Некорректный email"),
    body("password").isLength({ min: 6 }).withMessage("Минимум 6 символов")
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Некорректный email"),
    body("password").notEmpty().withMessage("Введите пароль")
  ],
  login
);

router.get("/me", requireAuth, me);

module.exports = router;
