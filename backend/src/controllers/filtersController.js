const db = require("../db");

async function getFacets(req, res) {
  try {
    const years = await db.query(
      `SELECT year, COUNT(*)::int AS count
       FROM movies
       WHERE year IS NOT NULL
       GROUP BY year
       ORDER BY year DESC`
    );
    const countries = await db.query(
      `SELECT country, COUNT(*)::int AS count
       FROM movies
       WHERE country IS NOT NULL AND country <> ''
       GROUP BY country
       ORDER BY count DESC, country ASC`
    );
    const genres = await db.query(
      `SELECT genre, COUNT(*)::int AS count
       FROM movies
       WHERE genre IS NOT NULL AND genre <> ''
       GROUP BY genre
       ORDER BY count DESC, genre ASC`
    );
    const series = await db.query(
      `SELECT is_series, COUNT(*)::int AS count
       FROM movies
       GROUP BY is_series`
    );

    return res.json({
      years: years.rows,
      countries: countries.rows,
      genres: genres.rows,
      series: series.rows
    });
  } catch (error) {
    return res.status(500).json({ message: "Ошибка получения фильтров" });
  }
}

module.exports = { getFacets };

