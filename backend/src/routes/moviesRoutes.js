const express = require("express");
const { body } = require("express-validator");
const {
  createMovie,
  deleteMovie,
  getMovieById,
  getMovies,
  getFeaturedMovies,
  updateMovie
} = require("../controllers/moviesController");
const { requireAdmin, requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getMovies);
router.get("/featured", getFeaturedMovies);
router.get("/:id", getMovieById);
router.post(
  "/",
  requireAuth,
  requireAdmin,
  [
    body("title").trim().notEmpty().withMessage("Название обязательно"),
    body("description").trim().notEmpty().withMessage("Описание обязательно"),
    body("image").trim().isURL().withMessage("Нужна корректная ссылка на постер")
  ],
  createMovie
);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  [
    body("title").trim().notEmpty().withMessage("Название обязательно"),
    body("description").trim().notEmpty().withMessage("Описание обязательно"),
    body("image").trim().isURL().withMessage("Нужна корректная ссылка на постер")
  ],
  updateMovie
);
router.delete("/:id", requireAuth, requireAdmin, deleteMovie);

module.exports = router;
