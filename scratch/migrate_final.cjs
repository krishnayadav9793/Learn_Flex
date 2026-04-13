const postgres = require('postgres');
const sql = postgres('postgresql://neondb_owner:npg_X9RMCWeJS4gj@ep-icy-silence-aiwdw5wn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function run() {
  try {
    console.log("Adding columns if missing...");
    await sql`ALTER TABLE practice_submission_answers ADD COLUMN IF NOT EXISTS marked_option TEXT`;
    await sql`ALTER TABLE practice_submission_answers ADD COLUMN IF NOT EXISTS ques_id TEXT`;
    console.log("Migration complete!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit();
  }
}
run();
