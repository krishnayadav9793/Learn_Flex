import { sql, connectNeon } from './util/neonConnect.js';

async function test() {
    await connectNeon();
    const q1 = await sql`SELECT "Question_Statement" FROM "Questions" WHERE "subject_id" = 1 LIMIT 1`;
    const q2 = await sql`SELECT "Question_Statement" FROM "Questions" WHERE "subject_id" = 2 LIMIT 1`;
    const q3 = await sql`SELECT "Question_Statement" FROM "Questions" WHERE "subject_id" = 3 LIMIT 1`;
    
    console.log("Subject 1:", q1[0]?.Question_Statement?.substring(0, 50));
    console.log("Subject 2:", q2[0]?.Question_Statement?.substring(0, 50));
    console.log("Subject 3:", q3[0]?.Question_Statement?.substring(0, 50));
    process.exit(0);
}

test();
