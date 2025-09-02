import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const noteId = searchParams.get('noteId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    let result;
    if (noteId) {
      result = await pool.query(
        `SELECT sessions.*, notes.title
         FROM sessions
         JOIN notes ON sessions.note_id = notes.id
         WHERE sessions.user_id = $1 AND sessions.note_id = $2
         ORDER BY sessions.created_at ASC`,
        [userId, noteId]
      );
    } else {
      result = await pool.query(
        `SELECT sessions.*, notes.title
         FROM sessions
         JOIN notes ON sessions.note_id = notes.id
         WHERE sessions.user_id = $1
         ORDER BY sessions.created_at ASC`,
        [userId]
      );
    }

    return NextResponse.json({ sessions: result.rows || [] }); // ✅ Always return array
  } catch (error) {
    console.error('GET /sessions error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}



export async function POST(req: NextRequest) {
  try {
    const { user_id, note_id, similarity, stars, word_count, duration_secs, wpm } = await req.json();

    const result = await pool.query(
      `INSERT INTO sessions (user_id, note_id, similarity, stars, word_count, duration_secs, wpm)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, note_id, similarity, stars, word_count, duration_secs, wpm]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST /sessions error:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}


// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const userId = searchParams.get('userId');
//     const noteId = searchParams.get('noteId');

//     if (!userId || !noteId) {
//       return NextResponse.json({ error: 'Missing userId or noteId' }, { status: 400 });
//     }

//     const result = await pool.query(
//       'SELECT * FROM sessions WHERE user_id = $1 AND note_id = $2 ORDER BY created_at DESC',
//       [userId, noteId]
//     );

//     return NextResponse.json(result.rows);
//   } catch (error) {
//     console.error('GET /sessions error:', error);
//     return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
//   }
// }
