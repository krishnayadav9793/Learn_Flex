import postgres from 'postgres';
const sql = postgres('postgresql://neondb_owner:npg_X9RMCWeJS4gj@ep-icy-silence-aiwdw5wn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

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
  } finally {
    process.exit();
  }
}
run();
