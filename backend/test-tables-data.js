import { sql, connectNeon } from './util/neonConnect.js';

async function test() {
    await connectNeon();
    const topics = await sql`SELECT * FROM "Topic" LIMIT 10`;
    const questions = await sql`SELECT "subject_id", "topic_id", COUNT(*) FROM "Questions" GROUP BY "subject_id", "topic_id" LIMIT 10`;
    
    console.log("Topics:", topics);
    console.log("Question counts by subject/topic:", questions);
    process.exit(0);
}

test();
