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

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    const userId = params?.id;

    console.log('🗑️ DELETE request received for user ID:', userId);
    console.log('🗑️ Params object:', params);

    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('❌ Invalid user ID:', userId);
      return new Response(
        JSON.stringify({ error: 'Valid User ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('🗑️ Deleting user with ID:', userId);

    // Start a transaction to ensure all related data is deleted
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Delete sessions first (due to foreign key constraints)
      const deletedSessions = await client.query(
        'DELETE FROM sessions WHERE user_id = $1',
        [userId]
      );

      // Delete notes
      const deletedNotes = await client.query(
        'DELETE FROM notes WHERE user_id = $1',
        [userId]
      );

      // Delete the user
      const deletedUser = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING *',
        [userId]
      );

      if (deletedUser.rows.length === 0) {
        await client.query('ROLLBACK');
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }

      await client.query('COMMIT');

      console.log('✅ Successfully deleted user:', {
        user: deletedUser.rows[0].username,
        sessions: deletedSessions.rowCount,
        notes: deletedNotes.rowCount
      });

      return new Response(
        JSON.stringify({
          message: 'User deleted successfully',
          user: deletedUser.rows[0],
          deletedSessions: deletedSessions.rowCount,
          deletedNotes: deletedNotes.rowCount
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('❌ User deletion error:', err);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to delete user',
        details: err instanceof Error ? err.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
