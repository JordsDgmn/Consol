// lib/db.js
import { Pool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:geodgmn@localhost:5432/Consol';

export const pool = new Pool({
  connectionString,
  // For serverless, keep connections minimal
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
