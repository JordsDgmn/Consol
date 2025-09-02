import { NextRequest, NextResponse } from 'next/server';
import { pool } from '../../../../lib/db';

// GET /api/notes/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    const userId = req.nextUrl.searchParams.get('userId');

    if (!noteId || !userId) {
      return NextResponse.json(
        { error: 'Missing userId or noteId' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM notes WHERE id = $1 AND user_id = $2`,
      [noteId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('GET /notes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}
// DELETE /api/notes/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const noteId = params.id;

  try {
    const result = await pool.query(
      'DELETE FROM notes WHERE id = $1 RETURNING *',
      [noteId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Note deleted',
      deleted: result.rows[0],
    });
  } catch (err) {
    console.error('Delete failed:', err);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
