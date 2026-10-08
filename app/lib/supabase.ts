import { createClient } from '@supabase/supabase-js';

/**
 * The server-side Supabase client.
 *
 * SERVICE ROLE, AND ONLY EVER ON THE SERVER. Row Level Security is enabled on
 * every table in that database with no policies attached, deliberately - the
 * comment in migration 0001 puts it as "a table that is open until someone
 * remembers to close it is open". So the anon key reads nothing at all, and the
 * service role is what a route handler has to use today.
 *
 * That key bypasses RLS entirely. It must never reach the browser: no
 * NEXT_PUBLIC_ prefix, and nothing that imports this file may be a client
 * component.
 *
 * HALF OF THAT HAS NOW HAPPENED, and the half that has not is the point of this
 * note. Migration 0053 put per-student policies in the database and the
 * dashboard moved to `/students/me`, which reads through the viewer's own
 * session - see supabase-session.ts. That route can no longer read anybody
 * else's rows even by mistake, which is the actual protection.
 *
 * `app/api/v1/uploads` still uses this client. It takes a `studentId` from the
 * caller and asks nobody who they are, so anyone can list or write another
 * student's creations by naming them. It is the remaining hole, it is not new,
 * and it is recorded in the file's own header. Closing it is the same change
 * made twice: the viewer's session instead of the caller's word.
 *
 * It fails closed. A missing variable throws here rather than producing a
 * client that returns empty results, because "no rows" and "not configured"
 * look identical to a caller and only one of them is a bug.
 */
/**
 * The client's type is DERIVED from the call below, never written out.
 *
 * `SupabaseClient` defaults its schema parameter to `public`, so annotating the
 * cache with the bare type rejects the `app` client this file now builds:
 *
 *   Type 'SupabaseClient<any, any, "app", ...>' is not assignable to
 *   type 'SupabaseClient<any, "public", "public", ...>'
 *
 * The honest fix is not to spell five generic parameters out here - they have
 * changed shape between supabase-js versions and would be a yearly chore - but
 * to let the factory below be the single statement of what this client is.
 */
type PortalClient = ReturnType<typeof build>;

let cached: PortalClient | null = null;

export function serverSupabase(): PortalClient {
  if (cached !== null) return cached;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing = [
    url ? null : 'SUPABASE_URL',
    key ? null : 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Supabase is not configured: ${missing.join(', ')} missing. See .env.local.`,
    );
  }

  cached = build(url as string, key as string);
  return cached;
}

/**
 * The one place that says what this client is. See `PortalClient` above.
 */
function build(url: string, key: string) {
  return createClient(url, key, {
    // THE PORTAL'S TABLES LIVE IN `app`, NOT `public`, AND THIS LINE IS WHY THE
    // DASHBOARD WAS SHOWING FIXTURES.
    //
    // Migration 0047 moved the eleven portal-owned tables into their own schema
    // so that exposing the portal would not expose `purchase`, `pay_transaction`
    // and `raw_wl` beside them. supabase-js defaults to `public`, and nothing
    // here said otherwise, so every `.from('student')` and `.from('creation')`
    // asked PostgREST for a table that does not exist:
    //
    //   404 PGRST205  "Could not find the table 'public.student'"
    //
    // Measured 8 Oct 2026: all thirteen relations the portal reads - student,
    // identity, class_session, attendance_record, class_session_teacher, cohort,
    // teacher, creation, organization and the link tables - are in `app`, and
    // NONE of them exists in `public`. So the default belongs here, once, rather
    // than as a `.schema('app')` that each new query has to remember.
    //
    // The route handlers never surfaced this. `live-data.js` treats a failed
    // fetch as "fall back to fixtures", so a broken query and a slow one look
    // identical on screen - which is the masquerade that file's own header warns
    // about.
    //
    // THE TRADE: a query against the WellnessLiving mirror - `person`,
    // `purchase`, `session`, `sync_*`, all still in `public` - must now say
    // `.schema('public')` explicitly. That is the correct way round. The portal
    // is specified to read the hub and never to learn that WellnessLiving
    // exists, so reaching into the mirror should be the thing that looks
    // unusual at the call site.
    db: { schema: 'app' },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
