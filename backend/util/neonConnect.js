import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless';
import { hasNeonConfig } from './envFlags.js';

dotenv.config();

const sql = hasNeonConfig() ? neon(process.env.NEON_URL) : null;

const connectNeon = async () => {
  if (!sql) {
    console.log('Neon URL missing, running with demo quiz data');
    return;
  }

  try {
    await sql`SELECT 1`;
    console.log('PostgreSQL Connected');
  } catch (error) {
    console.error('Database connection failed', error);
  }
}

export { sql, connectNeon };
