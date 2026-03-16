import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

async function check() {
  const pool = new Pool({
    connectionString: process.env.NEON_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const questionsRes = await pool.query('SELECT count(*) FROM practice_questions');
    console.log("Questions in DB:", questionsRes.rows[0].count);
    
    const subjectsRes = await pool.query('SELECT subject_key, subject_label FROM practice_subjects');
    console.log("Subjects in DB:", subjectsRes.rows);
  } catch(e) {
    console.error("PG Connection Error:", e);
  } finally {
    pool.end();
  }
}
check();
