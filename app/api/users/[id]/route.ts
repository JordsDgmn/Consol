// app/api/users/[id]/route.ts
import { pool } from '@/lib/db';
import type { NextRequest } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { username } = await req.json();
    const result = await pool.query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING *',
      [username, params.id]
    );
    return new Response(JSON.stringify(result.rows[0]), { status: 200 });
  } catch (err) {
    console.error('PUT /users/[id] error:', err);
    return new Response('Failed to update user', { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [params.id]);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('DELETE /users/[id] error:', err);
    return new Response('Failed to delete user', { status: 500 });
  }
}
