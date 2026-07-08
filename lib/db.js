// lib/db.js
import pkg from 'pg';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:geodgmn@localhost:5432/Consol'
});
