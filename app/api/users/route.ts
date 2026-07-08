// app/api/users/route.ts
import { pool } from '@/lib/db';
import type { NextRequest } from 'next/server';

export async function GET() {
  try {
    console.log('[API] GET /users - Starting query');
    console.log('[API] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    
    const result = await pool.query(`
      SELECT 
        u.id,
        u.username,
        u.profile_picture_url,
        u.created_at,
        COUNT(DISTINCT n.id) AS notes,
        ROUND(AVG(s.wpm)::numeric, 1) AS speed,
        ROUND(AVG(s.stars)::numeric, 1) AS mastery,
        ROUND(AVG(s.similarity)::numeric, 2) AS comprehension,
        MAX(s.created_at) AS last_active
      FROM users u
      LEFT JOIN notes n ON u.id = n.user_id
      LEFT JOIN sessions s ON u.id = s.user_id
      GROUP BY u.id
      ORDER BY u.id ASC
    `);

    console.log('[API] GET /users - Query successful, rows:', result.rows?.length || 0);
    
    return new Response(JSON.stringify(result.rows), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('[API] GET /users - Error:', err?.message || err);
    console.error('[API] Error details:', err);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch users', 
      details: String(err?.message || err) 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    const result = await pool.query(
      'INSERT INTO users (username) VALUES ($1) RETURNING *',
      [username]
    );
    return new Response(JSON.stringify(result.rows[0]), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('POST /users error:', err);
    return new Response(JSON.stringify({ error: 'Failed to create user', details: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
