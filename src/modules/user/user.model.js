import pool from "../../config/database.js";

export async function createUser({ firstName, lastName, email, passwordHash }) {
  const [result] = await pool.execute(
    `INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`,
    [firstName, lastName, email, passwordHash]
  );

  return {
    id: result.insertId,
    firstName,
    lastName,
    email,
  };
}

export async function findUserByEmail(email) {
  const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows[0];
}

export async function findUserById(id) {
  const [rows] = await pool.execute(`SELECT id, first_name, last_name, email, created_at FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows[0];
}
