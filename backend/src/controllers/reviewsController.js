const { validationResult } = require("express-validator");
const db = require("../db");

async function recalculateMovieRating(movieId) {
  await db.query(
    `UPDATE movies
     SET rating = COALESCE((
       SELECT ROUND(AVG(rating)::numeric, 1)
       FROM reviews
       WHERE movie_id = $1
     ), 0)
     WHERE id = $1`,
    [movieId]
  );
}

async function addReview(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation error", errors: errors.array() });
    }

    const { movieId, text, rating } = req.body;
    const movie = await db.query("SELECT id FROM movies WHERE id = $1", [movieId]);
    if (movie.rowCount === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const result = await db.query(
      `INSERT INTO reviews (user_id, movie_id, text, rating, likes)
       VALUES ($1, $2, $3, $4, 0)
       RETURNING id, user_id, movie_id, text, rating, likes, created_at`,
      [req.user.id, movieId, text.trim(), rating]
    );

    await recalculateMovieRating(movieId);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add review" });
  }
}

async function getReviewsByMovie(req, res) {
  try {
    const result = await db.query(
      `SELECT r.id, r.user_id, r.movie_id, r.text, r.rating, r.likes, r.created_at, u.username
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.movie_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.movieId]
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load reviews" });
  }
}

async function likeReview(req, res) {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const likeInsert = await client.query(
      `INSERT INTO review_likes (user_id, review_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, review_id) DO NOTHING
       RETURNING id`,
      [req.user.id, req.params.id]
    );

    if (likeInsert.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "You have already liked this review" });
    }

    const result = await client.query(
      `UPDATE reviews
       SET likes = likes + 1
       WHERE id = $1
       RETURNING id, likes`,
      [req.params.id]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Review not found" });
    }

    await client.query("COMMIT");
    return res.json(result.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    return res.status(500).json({ message: "Failed to like review" });
  } finally {
    client.release();
  }
}

async function deleteReview(req, res) {
  try {
    const reviewResult = await db.query(
      "DELETE FROM reviews WHERE id = $1 RETURNING movie_id",
      [req.params.id]
    );
    if (reviewResult.rowCount === 0) {
      return res.status(404).json({ message: "Review not found" });
    }
    await recalculateMovieRating(reviewResult.rows[0].movie_id);
    return res.json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete review" });
  }
}

module.exports = { addReview, getReviewsByMovie, likeReview, deleteReview };
