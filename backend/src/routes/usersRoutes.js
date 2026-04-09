const express = require("express");
const { me } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  getUserStats,
  updateProfile,
  uploadAvatar,
  setRandomAvatar,
  avatarUpload
} = require("../controllers/usersController");

const router = express.Router();

// GET /api/users/me — данные текущего пользователя (требует авторизации)
router.get("/me", requireAuth, me);

// GET /api/users/me/stats — статистика пользователя
router.get("/me/stats", requireAuth, getUserStats);

// PUT /api/users/update — обновление профиля
router.put("/update", requireAuth, updateProfile);

// POST /api/users/avatar — загрузка аватара
router.post(
  "/avatar",
  requireAuth,
  (req, res, next) => {
    avatarUpload.single("avatar")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadAvatar
);

// POST /api/users/avatar/random — случайный аватар
router.post("/avatar/random", requireAuth, setRandomAvatar);

module.exports = router;
