import { sql, connectNeon } from './util/neonConnect.js';

async function list() {
    await connectNeon();
    const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `;
    console.log(JSON.stringify(tables.map(t => t.table_name)));
    process.exit(0);
}

list();
