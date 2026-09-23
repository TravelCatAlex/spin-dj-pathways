import { createClient, type SupabaseClient } from '@supabase/supabase-js';

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
 * component. When the portal gains real sign-in, the per-student policies move
 * to the database and this client is replaced by the user's own session - at
 * which point the route stops being able to read anybody else's rows even by
 * mistake, which is the actual protection.
 *
 * It fails closed. A missing variable throws here rather than producing a
 * client that returns empty results, because "no rows" and "not configured"
 * look identical to a caller and only one of them is a bug.
 */
/**
 * The schema is part of the client's TYPE, not just its configuration.
 * `SupabaseClient` on its own means `'public'`, so naming it here is what makes
 * a route that reaches for a mirror table fail at build rather than at runtime.
 */
type ServerClient = SupabaseClient<any, any, 'app'>;

let cached: ServerClient | null = null;

export function serverSupabase(): ServerClient {
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

  cached = createClient(url as string, key as string, {
    auth: { persistSession: false, autoRefreshToken: false },
    // THE PORTAL'S TABLES LIVE IN `app`, NOT `public` (migration 0048).
    //
    // `public` is the WellnessLiving mirror the sync owns - person, session,
    // purchase, pay_transaction, raw_wl. `app` is the thirteen tables this
    // portal reads, and the split exists so that exposing one to PostgREST does
    // not expose the other.
    //
    // Set here rather than per call: `.from('student')` in a route resolves
    // against this default, so a route that forgets cannot silently read the
    // wrong schema. A route that genuinely needs the mirror asks for it by
    // name, with `.schema('public')`.
    //
    // Supabase must also list `app` under Settings -> API -> Exposed schemas.
    // Without that PostgREST does not see the schema at all and every query
    // here returns PGRST106, not an empty result.
    db: { schema: 'app' },
  });
  return cached;
}
