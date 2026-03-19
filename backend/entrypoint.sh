#!/bin/sh
set -e

echo "Running database migrations..."
node -e "
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const dir = path.resolve(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
    console.log('Migration:', file);
    try { await pool.query(sql); } catch(e) {
      if (e.code === '42P07' || e.code === '42710') { console.log('  (already exists, skipping)'); }
      else throw e;
    }
  }
  await pool.end();
  console.log('Migrations complete.');
})().catch(err => { console.error('Migration failed:', err); process.exit(1); });
"

echo "Starting server..."
exec node dist/index.js
