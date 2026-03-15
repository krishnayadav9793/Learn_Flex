import { sql, connectNeon } from './util/neonConnect.js';

async function test() {
    try {
        await connectNeon();
        
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log("Tables in current ep-icy-silence active DB:");
        console.log(tables.map(t => t.table_name).join(", "));
    } catch (e) {
        console.error("Test failed with error:", e);
    }
    process.exit(0);
}

test();
