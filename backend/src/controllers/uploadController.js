const multer = require("multer");
const path = require("path");

// Configure storage for videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/videos"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "video-" + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (only mp4/webm)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Недопустимый формат файла. Разрешены только mp4, webm и ogg."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

async function uploadVideo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Файл не загружен" });
    }
    
    // Return the relative URL
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    return res.json({ 
      message: "Видео успешно загружено", 
      videoUrl: videoUrl 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Ошибка при загрузке видео" });
  }
}

module.exports = { upload, uploadVideo };
