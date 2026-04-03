const express = require("express");
const { upload, uploadVideo } = require("../controllers/uploadController");
const { requireAdmin, requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Define POST route for video upload
// Usage: POST /api/upload/video
router.post(
  "/video",
  requireAuth,
  requireAdmin,
  (req, res, next) => {
    upload.single("video")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  uploadVideo
);

module.exports = router;
