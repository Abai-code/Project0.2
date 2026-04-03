const db = require("../db");

async function getFavorites(req, res) {
  try {
    const userId = req.user.id;
    const result = await db.query(
      `SELECT m.* 
       FROM movies m
       JOIN favorites f ON m.id = f.movie_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("Get favorites error:", error);
    return res.status(500).json({ message: "Ошибка получения избранного" });
  }
}

async function addFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({ message: "movieId обязателен" });
    }

    // Проверяем, существует ли фильм
    const movieCheck = await db.query("SELECT id FROM movies WHERE id = $1", [movieId]);
    if (movieCheck.rowCount === 0) {
      return res.status(404).json({ message: "Фильм не найден" });
    }

    // Добавляем в избранное (игнорируем если уже есть благодаря UNIQUE)
    await db.query(
      "INSERT INTO favorites (user_id, movie_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, movieId]
    );

    return res.status(201).json({ message: "Добавлено в избранное" });
  } catch (error) {
    console.error("Add favorite error:", error);
    return res.status(500).json({ message: "Ошибка добавления в избранное" });
  }
}

async function removeFavorite(req, res) {
  try {
    const userId = req.user.id;
    const { movieId } = req.params;

    const result = await db.query(
      "DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2",
      [userId, movieId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Фильм не найден в избранном" });
    }

    return res.json({ message: "Удалено из избранного" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return res.status(500).json({ message: "Ошибка удаления из избранного" });
  }
}

module.exports = { getFavorites, addFavorite, removeFavorite };
