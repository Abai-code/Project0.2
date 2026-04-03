const express = require("express");
const { getFavorites, addFavorite, removeFavorite } = require("../controllers/favoritesController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Все роуты требуют авторизации
router.use(requireAuth);

router.get("/", getFavorites);
router.post("/", addFavorite);
router.delete("/:movieId", removeFavorite);

module.exports = router;
