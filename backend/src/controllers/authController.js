const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../db");
const { createToken } = require("../utils/token");

async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Ошибка валидации", errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Проверка сложности пароля
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Пароль должен содержать минимум 8 символов, заглавную букву, строчную букву, цифру и специальный символ (!@#$%^&*)",
      });
    }

    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "Пользователь уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, 'user')
       RETURNING id, username, email, role`,
      [username, email, passwordHash]
    );

    const user = result.rows[0];
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка регистрации" });
  }
}

async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Ошибка валидации", errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await db.query(
      "SELECT id, username, email, password, role FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Неверные данные для входа" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Неверные данные для входа" });
    }

    const token = createToken(user);
    delete user.password;
    return res.json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка входа" });
  }
}

async function me(req, res) {
  try {
    const result = await db.query(
      "SELECT id, username, email, role FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Ошибка получения профиля" });
  }
}

module.exports = { register, login, me };
