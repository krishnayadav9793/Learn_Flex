import { sql } from '../backend/util/neonConnect.js';
async function run() {
  try {
    // 1. Check triggers on the table
    const triggers = await sql`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table = 'practice_submission_answers'
    `;
    console.log("TRIGGERS:", JSON.stringify(triggers, null, 2));

    // 2. Check the column names of the table
    const columns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'practice_submission_answers'
    `;
    console.log("COLUMNS:", JSON.stringify(columns, null, 2));

    // 3. Search for the trigger function source if possible
    if (triggers.length > 0) {
       for (const t of triggers) {
         // This might return a lot of text, but we need to see the column references
         const func = await sql`
           SELECT routine_definition 
           FROM information_schema.routines 
           WHERE routine_name IN (
             SELECT action_statement FROM information_schema.triggers 
             WHERE trigger_name = ${t.trigger_name}
           )
         `;
         console.log(`FUNCTION FOR ${t.trigger_name}:`, JSON.stringify(func, null, 2));
       }
    }
  } catch (err) {
    console.error("DIAGNOSTIC FAILED:", err);
  }
}
run();
