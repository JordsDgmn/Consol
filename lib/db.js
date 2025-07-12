// lib/db.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Consol',
  password: 'geodgmn',
  port: 5432,
});
