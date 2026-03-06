import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 20,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
}
