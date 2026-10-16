import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../../../../lib/supabase-session';

/**
 * GET /api/v1/notes/[id]/history - the earlier versions of one note.
 *
 * Author-only, and that is RLS, not this file: `teacher_note_revision_author_select`
 * (migration 0057) matches on `author_teacher_id = app.current_teacher_id()`, so a
 * note that is not the viewer's returns no rows - the id in the path is a filter,
 * the policy is the authorisation. History is read-only everywhere: no user may
 * write `teacher_note_revision` at all, so there is only a GET here.
 *
 * Newest-first. Each row is a PREVIOUS body; the note's current text lives on the
 * note itself, so the UI shows "current" from the note and these beneath it.
 */
export const dynamic = 'force-dynamic';

interface RevisionRow {
  id: string;
  body: string;
  revised_at: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  let session: ReturnType<typeof sessionSupabase>;
  try {
    session = sessionSupabase(request);
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'not_configured', message: (error as Error).message } },
      { status: 500 },
    );
  }

  const { supabase: db, commit } = session;

  const { data: auth, error: authError } = await db.auth.getUser();
  if (authError || auth?.user == null) {
    return commit(
      NextResponse.json(
        { error: { code: 'not_signed_in', message: 'Sign in to read this.' } },
        { status: 401 },
      ),
    );
  }

  const { data: rows, error } = await db
    .from('teacher_note_revision')
    .select('id, body, revised_at')
    .eq('note_id', id)
    .order('revised_at', { ascending: false });

  if (error) {
    return commit(
      NextResponse.json(
        { error: { code: 'query_failed', message: error.message } },
        { status: 500 },
      ),
    );
  }

  return commit(NextResponse.json({ revisions: (rows ?? []) as RevisionRow[] }));
}
