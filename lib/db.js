// lib/db.js
// Use standard pg Pool locally, Neon serverless Pool on production
import { Pool as PostgresPool } from 'pg';
import { Pool as NeonPool } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:geodgmn@localhost:5432/Consol';
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// Use Neon serverless on Vercel, standard PostgreSQL locally
const Pool = isProduction ? NeonPool : PostgresPool;

export const pool = new Pool({
  connectionString,
  // For serverless/production, keep connections minimal
  max: isProduction ? 1 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
