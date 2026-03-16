import { sql, connectNeon } from './util/neonConnect.js';

async function list() {
    await connectNeon();
    const columns = await sql`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name IN ('Topic', 'ExamQuestion', 'Questions')
        ORDER BY table_name, ordinal_position
    `;
    console.log(JSON.stringify(columns));
    process.exit(0);
}

list();
