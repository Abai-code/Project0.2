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
const { requireAdmin, requireAuth, optionalAuth } = require("../middleware/authMiddleware");

const router = express.Router();
const currentYear = new Date().getFullYear() + 2;
const movieValidators = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("image").trim().isURL().withMessage("Image must be a valid URL"),
  body("movie_url").optional({ values: "falsy" }).trim().isURL().withMessage("Video URL must be a valid URL"),
  body("year").optional({ values: "falsy" }).isInt({ min: 1888, max: currentYear }).withMessage(`Year must be between 1888 and ${currentYear}`),
  body("country").optional({ values: "falsy" }).trim().isLength({ min: 2, max: 100 }).withMessage("Country must be between 2 and 100 characters"),
  body("genre").optional({ values: "falsy" }).trim().isLength({ min: 2, max: 50 }).withMessage("Genre must be between 2 and 50 characters"),
  body("rating").optional({ values: "falsy" }).isFloat({ min: 0, max: 10 }).withMessage("Rating must be between 0 and 10"),
];

router.get("/", optionalAuth, getMovies);
router.get("/featured", optionalAuth, getFeaturedMovies);
router.get("/:id", optionalAuth, getMovieById);
router.post("/", requireAuth, requireAdmin, movieValidators, createMovie);
router.put("/:id", requireAuth, requireAdmin, movieValidators, updateMovie);
router.delete("/:id", requireAuth, requireAdmin, deleteMovie);

module.exports = router;
