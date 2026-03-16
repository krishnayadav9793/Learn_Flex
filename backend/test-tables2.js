import { sql, connectNeon } from './util/neonConnect.js';

async function test() {
    console.log("Checking tables in Learn_flex_copy database...");
    try {
        await connectNeon();
        
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        console.log("Tables:");
        console.log(tables);
    } catch (e) {
        console.error("Test failed with error:", e);
    }
    process.exit(0);
}

test();
