import { sql, connectNeon } from './util/neonConnect.js';

async function test() {
    console.log("Starting DB test inside Learn_flex_copy workspace...");
    try {
        await connectNeon();
        
        const quizId = '24';
        console.log(`Executing direct query on "Questions" table for Ques_id = ${quizId}...`);
        
        const questions = await sql`
      SELECT 
        "Ques_id",
        "Question_Statement",
        "Option_1",
        "Option_2",
        "Option_3",
        "Option_4",
        "Image",
        "Answer"
      FROM "Questions"
      WHERE "Ques_id" = ${quizId}
    `;
        console.log("Success! Extracted Data:");
        console.log(questions);
    } catch (e) {
        console.error("Test failed with error:", e);
    }
    process.exit(0);
}

test();
