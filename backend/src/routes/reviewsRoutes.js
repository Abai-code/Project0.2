const express = require("express");
const { body } = require("express-validator");
const {
  addReview,
  deleteReview,
  getReviewsByMovie,
  likeReview
} = require("../controllers/reviewsController");
const { requireAdmin, requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  [
    body("movieId").isInt({ min: 1 }).withMessage("Некорректный ID фильма"),
    body("text").trim().notEmpty().withMessage("Отзыв не может быть пустым"),
    body("rating").isInt({ min: 1, max: 10 }).withMessage("Оценка от 1 до 10")
  ],
  addReview
);
router.get("/:movieId", getReviewsByMovie);
router.post("/:id/like", requireAuth, likeReview);
router.delete("/:id", requireAuth, requireAdmin, deleteReview);

module.exports = router;
