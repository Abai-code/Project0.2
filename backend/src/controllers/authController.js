const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const db = require("../db");
const { createToken } = require("../utils/token");

async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation error", errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, an uppercase letter, a lowercase letter, a digit, and a special character.",
      });
    }

    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "User already exists" });
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
    return res.status(500).json({ message: "Registration failed" });
  }
}

async function login(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation error", errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await db.query(
      "SELECT id, username, email, password, role FROM users WHERE email = $1",
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user);
    delete user.password;
    return res.json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
}

async function me(req, res) {
  try {
    const result = await db.query(
      "SELECT id, username, email, role, avatar_url FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load profile" });
  }
}

module.exports = { register, login, me };
