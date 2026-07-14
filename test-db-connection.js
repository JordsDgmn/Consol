#!/usr/bin/env node
const { Pool } = require('@neondatabase/serverless');

const dbUrl = 'postgresql://neondb_owner:npg_7wDFcjgxBm4b@ep-proud-lake-aoa31hnk.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

console.log('🔍 Testing database connection...');
console.log('Connection string:', dbUrl.replace(/:[^@]*@/, ':***@'));

const pool = new Pool({ connectionString: dbUrl });

pool.query('SELECT 1 as test')
  .then(() => {
    console.log('✅ Database connection successful!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
