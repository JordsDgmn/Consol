import { pool } from '@/lib/db';

export async function GET() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Test basic connection
    const result = await pool.query('SELECT 1 as test');
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Database connection works!',
      test: result.rows[0],
      dbUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Database test error:', err);
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(err),
      dbUrl: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
