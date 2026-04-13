import dotenv from 'dotenv';
dotenv.config({ path: './backend/.env' });
import { sql } from './backend/util/neonConnect.js';

async function run() {
  try {
    console.log("Checking columns...");
    const cols = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'practice_submission_answers'
    `;
    const names = cols.map(c => c.column_name);
    console.log("Existing columns:", names);

    if (!names.includes('marked_option')) {
      console.log("Adding marked_option column...");
      await sql`ALTER TABLE practice_submission_answers ADD COLUMN marked_option TEXT`;
      console.log("Column added successfully!");
    } else {
      console.log("marked_option column already exists.");
    }
  } catch (err) {
    console.error("MIGRATION FAILED:", err);
  } finally {
    process.exit();
  }
}
run();
