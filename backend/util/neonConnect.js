import dotenv from 'dotenv'
import postgres from 'postgres';
import { hasNeonConfig } from './envFlags.js';

dotenv.config();

const sql = hasNeonConfig() ? postgres(process.env.NEON_URL, { ssl: 'require' }) : null;

const connectNeon = async () => {
  // console.log(process.env.NEON_URL)
  if (!sql) {
    console.log('Neon URL missing, running with demo quiz data');
    return;
  }
  
  try {
    const res=await sql`SELECT 1 `;
    console.log('PostgreSQL Connected');
  } catch (error) {
    console.log('Database connection failed', error);
  }
}

export  { sql, connectNeon };
