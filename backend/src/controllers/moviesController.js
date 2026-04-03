const { validationResult } = require("express-validator");
const db = require("../db");
const fs = require("fs");
const path = require("path");

const MOVIE_SELECT_FIELDS =
  "id, title, description, image, movie_url, year, country, genre, is_series, rating, featured, created_at";

function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return false;
}

function getValidationError(req, res) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  return res.status(400).json({ message: "Validation error", errors: errors.array() });
}

function normalizeMoviePayload(body) {
  return {
    title: body.title?.trim(),
    description: body.description?.trim(),
    image: body.image?.trim(),
    movie_url: body.movie_url?.trim() || null,
    year: body.year === null || body.year === undefined || body.year === "" ? null : Number(body.year),
    country: body.country?.trim() || null,
    genre: body.genre?.trim() || null,
    is_series: parseBoolean(body.is_series),
    rating: Number(body.rating) || 0,
    featured: parseBoolean(body.featured),
  };
}

async function getMovies(req, res) {
  try {
    const { search = "", year, country, genre, isSeries, sort = "new" } = req.query;

    const where = ["LOWER(m.title) LIKE LOWER($1)"];
    const params = [`%${search}%`];
    let idx = 2;

    if (year) {
      where.push(`m.year = $${idx++}`);
      params.push(Number(year));
    }
    if (country) {
      where.push(`m.country = $${idx++}`);
      params.push(country);
    }
    if (genre) {
      where.push(`m.genre = $${idx++}`);
      params.push(genre);
    }
    if (typeof isSeries !== "undefined" && isSeries !== "") {
      where.push(`m.is_series = $${idx++}`);
      params.push(isSeries === "true" || isSeries === true);
    }

    const orderBy =
      sort === "rating"
        ? "m.rating DESC, m.created_at DESC"
        : sort === "old"
          ? "m.created_at ASC"
          : "m.created_at DESC";

    const currentUserId = req.user?.id || 0;

    const result = await db.query(
      `SELECT m.*, 
              (f.id IS NOT NULL) as is_favorite
       FROM movies m
       LEFT JOIN favorites f ON m.id = f.movie_id AND f.user_id = $${idx}
       WHERE ${where.join(" AND ")}
       ORDER BY ${orderBy}`,
      [...params, currentUserId]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("Get movies error details:", error);
    return res.status(500).json({ message: "Failed to load movies", detail: error.message });
  }
}

async function getMovieById(req, res) {
  try {
    const currentUserId = req.user?.id || 0;
    const result = await db.query(
      `SELECT m.*, (f.id IS NOT NULL) as is_favorite 
       FROM movies m
       LEFT JOIN favorites f ON m.id = f.movie_id AND f.user_id = $2
       WHERE m.id = $1`,
      [req.params.id, currentUserId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load movie" });
  }
}

async function getFeaturedMovies(req, res) {
  try {
    const currentUserId = req.user?.id || 0;
    const result = await db.query(
      `SELECT m.*, (f.id IS NOT NULL) as is_favorite
       FROM movies m
       LEFT JOIN favorites f ON m.id = f.movie_id AND f.user_id = $1
       WHERE m.featured = TRUE 
       ORDER BY m.created_at DESC LIMIT 7`,
      [currentUserId]
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load featured movies" });
  }
}

async function createMovie(req, res) {
  try {
    const validationError = getValidationError(req, res);
    if (validationError) {
      return validationError;
    }

    const movie = normalizeMoviePayload(req.body);
    const result = await db.query(
      `INSERT INTO movies (title, description, image, movie_url, year, country, genre, is_series, rating, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${MOVIE_SELECT_FIELDS}`,
      [movie.title, movie.description, movie.image, movie.movie_url, movie.year, movie.country, movie.genre, movie.is_series, movie.rating, movie.featured]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create movie error:", error);
    return res.status(500).json({ message: "Failed to create movie" });
  }
}

async function updateMovie(req, res) {
  try {
    const validationError = getValidationError(req, res);
    if (validationError) {
      return validationError;
    }

    const movie = normalizeMoviePayload(req.body);
    const result = await db.query(
      `UPDATE movies
       SET title = $1, description = $2, image = $3, movie_url = $4, year = $5, country = $6, genre = $7, is_series = $8, rating = $9, featured = $10
       WHERE id = $11
       RETURNING ${MOVIE_SELECT_FIELDS}`,
      [movie.title, movie.description, movie.image, movie.movie_url, movie.year, movie.country, movie.genre, movie.is_series, movie.rating, movie.featured, req.params.id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Update movie error:", error);
    return res.status(500).json({ message: "Failed to update movie" });
  }
}

async function deleteMovie(req, res) {
  try {
    const movieRes = await db.query("SELECT id, movie_url FROM movies WHERE id = $1", [req.params.id]);
    if (movieRes.rowCount === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const movie = movieRes.rows[0];

    if (movie.movie_url && movie.movie_url.startsWith("/uploads/videos/")) {
      const filePath = path.join(__dirname, "..", movie.movie_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("File deletion error:", err);
        }
      }
    }

    await db.query("DELETE FROM movies WHERE id = $1", [req.params.id]);

    return res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    console.error("Delete movie error:", error);
    return res.status(500).json({ message: "Failed to delete movie" });
  }
}

module.exports = { getMovies, getMovieById, getFeaturedMovies, createMovie, updateMovie, deleteMovie };
