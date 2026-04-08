const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:1234@localhost:5432/movie_service' });

const promoteUser = async (username) => {
  try {
    const res = await pool.query("UPDATE users SET role = 'admin' WHERE username = $1", [username]);
    if (res.rowCount > 0) {
      console.log(`User ${username} promoted to admin`);
    } else {
      console.log(`User ${username} not found`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
};

promoteUser('testuser');
