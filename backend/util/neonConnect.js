import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless';
dotenv.config();


const sql=neon(process.env.NEON_URL)
const connectNeon = async ()=>{
    try {
    const [result] = await sql`SELECT 1`;
    console.log("PostgreSQL Connected ✅");
  } catch (error) {
    console.error("Database connection failed ", error);
    process.exit(1);
  }
}

export  {sql,connectNeon};
