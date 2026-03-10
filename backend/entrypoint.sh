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
    await pool.query(sql);
  }
  await pool.end();
  console.log('Migrations complete.');
})().catch(err => { console.error('Migration failed:', err); process.exit(1); });
"

echo "Starting server..."
exec node dist/index.js
