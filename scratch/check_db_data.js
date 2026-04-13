import { sql } from '../backend/util/neonConnect.js';
async function run() {
  try {
    // 1. Find recent submissions for a user to get a real submissionId
    const subs = await sql`
      SELECT submission_id, subject_id, score, submitted_at
      FROM practice_submissions
      ORDER BY submitted_at DESC
      LIMIT 5
    `;
    console.log("RECENT SUBMISSIONS:", JSON.stringify(subs, null, 2));

    if (subs.length > 0) {
      const sid = subs[0].submission_id;
      // 2. Check if there are ANY answers for this submission
      const answers = await sql`
        SELECT * FROM practice_submission_answers
        WHERE submission_id = ${sid}
      `;
      console.log(`ANSWERS FOR ${sid}:`, JSON.stringify(answers, null, 2));

      // 3. Check some sample questions to see the ID format
      const questions = await sql`
        SELECT "Ques_id", "Question_Statement" FROM "Questions" LIMIT 3
      `;
      console.log("SAMPLE QUESTIONS:", JSON.stringify(questions, null, 2));
    }
  } catch (err) {
    console.error("DIAGNOSTIC FAILED:", err);
  }
}
run();
