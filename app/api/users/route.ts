// app/api/users/route.ts
import { pool } from '@/lib/db'; // your existing db.js
import type { NextRequest } from 'next/server';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (err) {
    console.error('GET /users error:', err);
    return new Response('Failed to fetch users', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();
    const result = await pool.query(
      'INSERT INTO users (username) VALUES ($1) RETURNING *',
      [username]
    );
    return new Response(JSON.stringify(result.rows[0]), { status: 201 });
  } catch (err) {
    console.error('POST /users error:', err);
    return new Response('Failed to create user', { status: 500 });
  }
}
