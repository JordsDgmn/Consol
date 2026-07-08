// lib/db.js
import pkg from 'pg';
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:geodgmn@localhost:5432/Consol',
  ssl: isProduction ? { rejectUnauthorized: false } : false
});
