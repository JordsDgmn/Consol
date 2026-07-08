// lib/db.js
import { Pool } from '@neondatabase/serverless';

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:geodgmn@localhost:5432/Consol'
});
