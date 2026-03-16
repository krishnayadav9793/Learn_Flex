import { sql, connectNeon } from './util/neonConnect.js';

async function list() {
    await connectNeon();
    try {
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'Topic' OR table_name = 'Questions'
            ORDER BY table_name, ordinal_position
        `;
        console.log("Columns:", columns);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

list();
