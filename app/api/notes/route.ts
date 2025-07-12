import { NextResponse } from 'next/server';
import { pool } from '../../../lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const result = await pool.query(
      'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    let { user_id, title, content } = await req.json();
    const word_count = content ? content.trim().split(/\s+/).length : 0;

    const result = await pool.query(
      `INSERT INTO notes (user_id, title, content, word_count)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, title, content, word_count]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, title, content } = await req.json();
    const word_count = content ? content.trim().split(/\s+/).length : 0;

    const result = await pool.query(
      `UPDATE notes
       SET title = $1, content = $2, word_count = $3
       WHERE id = $4 RETURNING *`,
      [title, content, word_count, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note deleted', deleted: result.rows[0] });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
