const express = require("express");
const { me } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users/me — данные текущего пользователя (требует авторизации)
router.get("/me", requireAuth, me);

module.exports = router;
