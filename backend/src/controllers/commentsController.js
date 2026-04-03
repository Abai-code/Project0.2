const db = require("../db");

async function getLatestComments(req, res) {
  try {
    const result = await db.query(
      `SELECT r.id, r.text, u.username as "userName", m.title as "movieTitle", r.created_at
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       JOIN movies m ON r.movie_id = m.id
       ORDER BY r.created_at DESC
       LIMIT 5`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error("Error fetching latest comments:", error);
    return res.status(500).json({ message: "Ошибка загрузки последних комментариев" });
  }
}

module.exports = { getLatestComments };
