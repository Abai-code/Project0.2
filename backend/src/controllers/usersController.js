const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");

// --- Multer config for avatar uploads ---
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/avatars"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Допустимые форматы: JPEG, PNG, WebP, GIF"), false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});

// --- GET /api/users/me/stats ---
async function getUserStats(req, res) {
  try {
    const ratingsResult = await db.query(
      "SELECT COUNT(*) AS count FROM reviews WHERE user_id = $1",
      [req.user.id]
    );
    const reviewsResult = await db.query(
      "SELECT COUNT(*) AS count FROM reviews WHERE user_id = $1 AND text IS NOT NULL AND text != ''",
      [req.user.id]
    );

    return res.json({
      ratingsCount: parseInt(ratingsResult.rows[0].count, 10),
      reviewsCount: parseInt(reviewsResult.rows[0].count, 10)
    });
  } catch (error) {
    console.error("getUserStats error:", error);
    return res.status(500).json({ message: "Не удалось загрузить статистику" });
  }
}

// --- PUT /api/users/update ---
async function updateProfile(req, res) {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Fetch current user
    const userResult = await db.query(
      "SELECT id, username, email, password, role, avatar_url FROM users WHERE id = $1",
      [userId]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    const user = userResult.rows[0];

    // --- Password change ---
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: "Введите текущий пароль" });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Неверный текущий пароль" });
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          message:
            "Пароль должен содержать минимум 8 символов, заглавную и строчную букву, цифру и спецсимвол."
        });
      }
    }

    // --- Check uniqueness ---
    if (username && username !== user.username) {
      const existing = await db.query(
        "SELECT id FROM users WHERE username = $1 AND id != $2",
        [username, userId]
      );
      if (existing.rowCount > 0) {
        return res.status(409).json({ message: "Имя пользователя уже занято" });
      }
    }
    if (email && email !== user.email) {
      const existing = await db.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, userId]
      );
      if (existing.rowCount > 0) {
        return res.status(409).json({ message: "Email уже используется" });
      }
    }

    // --- Build dynamic UPDATE ---
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (username && username !== user.username) {
      updates.push(`username = $${paramIndex++}`);
      values.push(username);
    }
    if (email && email !== user.email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10);
      updates.push(`password = $${paramIndex++}`);
      values.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "Нет данных для обновления" });
    }

    values.push(userId);
    const result = await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}
       RETURNING id, username, email, role, avatar_url`,
      values
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Не удалось обновить профиль" });
  }
}

// --- POST /api/users/avatar ---
async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Файл не загружен" });
    }

    const userId = req.user.id;

    // Delete old avatar file if it exists on disk
    const oldResult = await db.query(
      "SELECT avatar_url FROM users WHERE id = $1",
      [userId]
    );
    if (oldResult.rows[0]?.avatar_url) {
      const oldUrl = oldResult.rows[0].avatar_url;
      // Only delete local files (not external URLs)
      if (oldUrl.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, "../..", oldUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await db.query("UPDATE users SET avatar_url = $1 WHERE id = $2", [
      avatarUrl,
      userId
    ]);

    return res.json({ avatarUrl });
  } catch (error) {
    console.error("uploadAvatar error:", error);
    return res.status(500).json({ message: "Не удалось загрузить аватар" });
  }
}

// --- POST /api/users/avatar/random ---
async function setRandomAvatar(req, res) {
  try {
    const userId = req.user.id;
    const seed = Math.random().toString(36).substring(2, 10);
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;

    // Delete old local avatar if exists
    const oldResult = await db.query(
      "SELECT avatar_url FROM users WHERE id = $1",
      [userId]
    );
    if (oldResult.rows[0]?.avatar_url?.startsWith("/uploads/")) {
      const oldPath = path.join(__dirname, "../..", oldResult.rows[0].avatar_url);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    await db.query("UPDATE users SET avatar_url = $1 WHERE id = $2", [
      avatarUrl,
      userId
    ]);

    return res.json({ avatarUrl });
  } catch (error) {
    console.error("setRandomAvatar error:", error);
    return res.status(500).json({ message: "Не удалось сгенерировать аватар" });
  }
}

module.exports = { getUserStats, updateProfile, uploadAvatar, setRandomAvatar, avatarUpload };
