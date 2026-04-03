require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../db");

async function run() {
  const [username, email, password] = process.argv.slice(2);

  if (!username || !email || !password) {
    console.log("Usage: npm run create-admin -- <username> <email> <password>");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  await db.query(
    `INSERT INTO users (username, email, password, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE
     SET username = EXCLUDED.username,
         password = EXCLUDED.password,
         role = 'admin'`,
    [username, email, hash]
  );

  console.log("Admin user is ready.");
  process.exit(0);
}

run().catch((error) => {
  console.error("Failed to create admin:", error.message);
  process.exit(1);
});
