import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/db';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const noteId = params.id;

  try {
    const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING *', [noteId]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note deleted', deleted: result.rows[0] });
  } catch (err) {
    console.error('Delete failed:', err);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
