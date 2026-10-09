import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { sessionSupabase } from '../../../../lib/supabase-session';

/**
 * PATCH  /api/v1/notes/[id]  - edit the body of one of the teacher's own notes.
 * DELETE /api/v1/notes/[id]  - delete one of the teacher's own notes.
 *
 * Author-only, and that is RLS, not this file: `teacher_note_author_update` and
 * `teacher_note_author_delete` (migration 0056) match on
 * `author_teacher_id = app.current_teacher_id()`. A note that is not the viewer's
 * simply matches no row, so a PATCH or DELETE aimed at someone else's note reports
 * `not_found` rather than touching it. The id in the path is a filter, not an
 * authorisation - the policy is.
 *
 * Only the body is editable here. Changing a note's KIND (private <-> public) or
 * its subject is deliberately not offered: it re-opens the roster check and the
 * private/public constraint, and "delete and write a new one" is the clearer
 * action for what is a different note anyway.
 */
export const dynamic = 'force-dynamic';

interface NoteRow {
  id: string;
  visibility: 'private' | 'public';
  student_id: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

export async function PATCH(
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
        { error: { code: 'not_signed_in', message: 'Sign in to do this.' } },
        { status: 401 },
      ),
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return commit(
      NextResponse.json(
        { error: { code: 'bad_request', message: 'Body must be JSON.' } },
        { status: 400 },
      ),
    );
  }

  const body = typeof (payload as { body?: unknown }).body === 'string'
    ? ((payload as { body: string }).body).trim()
    : '';

  if (body === '') {
    return commit(
      NextResponse.json(
        { error: { code: 'bad_request', message: 'A note needs some text.' } },
        { status: 400 },
      ),
    );
  }

  const { data: updated, error: updateError } = await db
    .from('teacher_note')
    .update({ body })
    .eq('id', id)
    .select('id, visibility, student_id, body, created_at, updated_at')
    .limit(1);

  if (updateError) {
    return commit(
      NextResponse.json(
        { error: { code: 'update_failed', message: updateError.message } },
        { status: 400 },
      ),
    );
  }

  const row = (updated as NoteRow[] | null)?.[0];

  // No row updated: either it does not exist or it is not this teacher's. The two
  // are deliberately indistinguishable - a note the viewer may not touch must not
  // be confirmed to exist.
  if (row === undefined) {
    return commit(
      NextResponse.json(
        { error: { code: 'not_found', message: 'No such note.' } },
        { status: 404 },
      ),
    );
  }

  return commit(NextResponse.json({ note: row }));
}

export async function DELETE(
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
        { error: { code: 'not_signed_in', message: 'Sign in to do this.' } },
        { status: 401 },
      ),
    );
  }

  const { data: deleted, error: deleteError } = await db
    .from('teacher_note')
    .delete()
    .eq('id', id)
    .select('id')
    .limit(1);

  if (deleteError) {
    return commit(
      NextResponse.json(
        { error: { code: 'delete_failed', message: deleteError.message } },
        { status: 400 },
      ),
    );
  }

  const row = (deleted as { id: string }[] | null)?.[0];

  if (row === undefined) {
    return commit(
      NextResponse.json(
        { error: { code: 'not_found', message: 'No such note.' } },
        { status: 404 },
      ),
    );
  }

  return commit(NextResponse.json({ deleted: row.id }));
}
