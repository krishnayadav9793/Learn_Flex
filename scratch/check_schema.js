import { sql } from '../backend/util/neonConnect.js';
async function run() {
  try {
    const res = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'practice_submission_answers'
    `;
    console.log("COLUMNS:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("DIAGNOSTIC FAILED:", err);
  }
}
run();
