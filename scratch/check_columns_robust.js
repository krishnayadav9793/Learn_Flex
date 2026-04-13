import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { sql } from './backend/util/neonConnect.js';

async function run() {
  try {
    const res = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'practice_submission_answers'
    `;
    console.log("COLUMNS_FOUND:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("DIAGNOSTIC FAILED:", err);
  }
}
run();
