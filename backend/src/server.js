require("dotenv").config();

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const moviesRoutes = require("./routes/moviesRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const filtersRoutes = require("./routes/filtersRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const usersRoutes = require("./routes/usersRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const uploadsDir = path.join(__dirname, "uploads/videos");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

async function initDb() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user'))
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        image TEXT NOT NULL,
        movie_url TEXT,
        year INTEGER,
        country VARCHAR(100),
        genre VARCHAR(50),
        is_series BOOLEAN NOT NULL DEFAULT FALSE,
        featured BOOLEAN NOT NULL DEFAULT FALSE,
        rating DECIMAL(3, 1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
        likes INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, movie_id)
      );
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS review_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, review_id)
      );
    `);
    await db.query(`
      INSERT INTO movies (title, description, image, movie_url, year, country, genre, is_series, featured, rating)
      SELECT
        'Inception',
        'A thief who steals corporate secrets through dream-sharing technology.',
        'https://upload.wikimedia.org/wikipedia/en/7/7f/Inception_ver3.jpg',
        'https://example.com/watch/inception',
        2010,
        'USA',
        'Sci-Fi',
        FALSE,
        TRUE,
        0
      WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = 'Inception');
    `);
    await db.query(`
      INSERT INTO movies (title, description, image, movie_url, year, country, genre, is_series, featured, rating)
      SELECT
        'Interstellar',
        'Explorers travel through a wormhole to save humanity.',
        'https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg',
        'https://example.com/watch/interstellar',
        2014,
        'USA',
        'Sci-Fi',
        FALSE,
        TRUE,
        0
      WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = 'Interstellar');
    `);
    await db.query(`
      INSERT INTO movies (title, description, image, movie_url, year, country, genre, is_series, featured, rating)
      SELECT
        'The Matrix',
        'A hacker discovers the reality around him is simulated.',
        'https://upload.wikimedia.org/wikipedia/en/c/c1/The_Matrix_Poster.jpg',
        'https://example.com/watch/the-matrix',
        1999,
        'USA',
        'Action',
        FALSE,
        FALSE,
        0
      WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = 'The Matrix');
    `);
    console.log("Database tables checked/created.");
  } catch (err) {
    console.error("Database initialization error:", err);
  }
}

initDb();

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    return res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database health check error:", error);
    return res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/filters", filtersRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
