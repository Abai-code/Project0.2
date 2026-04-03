const { validationResult } = require("express-validator");
const db = require("../db");
const fs = require("fs");
const path = require("path");

const MOVIE_SELECT_FIELDS =
  "id, title, description, image, movie_url, year, country, genre, is_series, rating, featured, created_at";

function getValidationError(req, res) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  return res.status(400).json({ message: "Ошибка валидации", errors: errors.array() });
}

function normalizeMoviePayload(body) {
  return {
    title: body.title,
    description: body.description,
    image: body.image,
    movie_url: body.movie_url ?? null,
    year: body.year ?? null,
    country: body.country ?? null,
    genre: body.genre ?? null,
    is_series: Boolean(body.is_series),
    rating: Number(body.rating) || 0,
    featured: Boolean(body.featured),
  };
}

async function getMovies(req, res) {
  try {
    const { search = "", year, country, genre, isSeries, sort = "new" } = req.query;

    const where = ["LOWER(title) LIKE LOWER($1)"];
    const params = [`%${search}%`];
    let idx = 2;

    if (year) {
      where.push(`year = $${idx++}`);
      params.push(Number(year));
    }
    if (country) {
      where.push(`country = $${idx++}`);
      params.push(country);
    }
    if (genre) {
      where.push(`genre = $${idx++}`);
      params.push(genre);
    }
    if (typeof isSeries !== "undefined" && isSeries !== "") {
      where.push(`is_series = $${idx++}`);
      params.push(isSeries === "true" || isSeries === true);
    }

    const orderBy =
      sort === "rating"
        ? "rating DESC, created_at DESC"
        : sort === "old"
          ? "created_at ASC"
          : "created_at DESC";

    const result = await db.query(
      `SELECT ${MOVIE_SELECT_FIELDS}
       FROM movies
       WHERE ${where.join(" AND ")}
       ORDER BY ${orderBy}`,
      params
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Ошибка получения фильмов" });
  }
}

async function getMovieById(req, res) {
  try {
    const result = await db.query(`SELECT ${MOVIE_SELECT_FIELDS} FROM movies WHERE id = $1`, [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Фильм не найден" });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Ошибка получения фильма" });
  }
}

async function getFeaturedMovies(req, res) {
  try {
    const result = await db.query(
      `SELECT ${MOVIE_SELECT_FIELDS} FROM movies WHERE featured = TRUE ORDER BY created_at DESC LIMIT 7`
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Ошибка получения популярных фильмов" });
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
    return res.status(500).json({ message: "Ошибка создания фильма" });
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
      return res.status(404).json({ message: "Фильм не найден" });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Update movie error:", error);
    return res.status(500).json({ message: "Ошибка обновления фильма" });
  }
}

async function deleteMovie(req, res) {
  try {
    const movieRes = await db.query("SELECT id, movie_url FROM movies WHERE id = $1", [req.params.id]);
    if (movieRes.rowCount === 0) {
      return res.status(404).json({ message: "Фильм не найден" });
    }

    const movie = movieRes.rows[0];

    if (movie.movie_url && movie.movie_url.startsWith("/uploads/videos/")) {
      const filePath = path.join(__dirname, "..", movie.movie_url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Ошибка при удалении файла:", err);
        }
      }
    }

    await db.query("DELETE FROM movies WHERE id = $1", [req.params.id]);

    return res.json({ message: "Фильм и связанный файл удалены" });
  } catch (error) {
    console.error("Delete movie error:", error);
    return res.status(500).json({ message: "Ошибка удаления фильма" });
  }
}

module.exports = { getMovies, getMovieById, getFeaturedMovies, createMovie, updateMovie, deleteMovie };
