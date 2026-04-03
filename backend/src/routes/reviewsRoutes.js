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
    body("movieId").isInt({ min: 1 }).withMessage("Movie ID must be valid"),
    body("text").trim().isLength({ min: 3, max: 2000 }).withMessage("Review must be between 3 and 2000 characters"),
    body("rating").isInt({ min: 1, max: 10 }).withMessage("Rating must be between 1 and 10")
  ],
  addReview
);
router.get("/:movieId", getReviewsByMovie);
router.post("/:id/like", requireAuth, likeReview);
router.delete("/:id", requireAuth, requireAdmin, deleteReview);

module.exports = router;
