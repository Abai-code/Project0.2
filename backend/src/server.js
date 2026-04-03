require("dotenv").config();

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const moviesRoutes = require("./routes/moviesRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const filtersRoutes = require("./routes/filtersRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const usersRoutes = require("./routes/usersRoutes");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads/videos");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    return res.json({ status: "ok", database: "connected" });
  } catch (error) {
    return res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/filters", filtersRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: "Маршрут не найден" });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
