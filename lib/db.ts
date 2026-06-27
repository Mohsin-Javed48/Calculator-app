import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST || 'db',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'calculator',
  user: process.env.PGUSER || 'calculator_user',
  password: process.env.PGPASSWORD || 'calculator_pass',
});

export async function query(text: string, params?: (string | number)[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function saveCalculation(expression: string, result: number) {
  return query(
    'INSERT INTO calculations (expression, result) VALUES ($1, $2)',
    [expression, result]
  );
}

export async function getHistory(limit = 10) {
  return query(
    'SELECT * FROM calculations ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
}
