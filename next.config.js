/**
 * The storage host, derived from SUPABASE_URL rather than written down.
 *
 * next/image refuses a remote source whose hostname is not listed here, and the
 * signed URLs the uploads API returns are exactly that. Listing the host as a
 * literal would put a piece of per-environment configuration into source, where
 * dev and prod would then differ by an edited file - the same rule the sync
 * service holds itself to, where a structural test fails the build on a
 * hardcoded host.
 *
 * Absent SUPABASE_URL this stays empty and next/image simply refuses, which is
 * the right failure: a build that cannot resolve its own storage host should
 * not quietly serve half the page.
 */
function storageHostPatterns() {
  const url = process.env.SUPABASE_URL
  if (!url) return []
  try {
    return [{ protocol: 'https', hostname: new URL(url).hostname, pathname: '/storage/v1/**' }]
  } catch {
    return []
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 writes AGENTS.md and CLAUDE.md at the repo root on every dev run.
  // This project keeps its own docs, so the generated pair is just untracked
  // noise — turn the generation off rather than gitignore files that would
  // otherwise reappear each time the dev server starts.
  agentRules: false,

  images: {
    // Next 16 only generates the qualities listed here, and warns on any
    // component asking for one that is missing. 75 is the default the other
    // images use; 90 is for the hero banner, which is the largest artwork on
    // the page and the one place the extra detail is worth the bytes.
    qualities: [75, 90],

    // Student uploads are served from Supabase Storage as SIGNED urls, so the
    // path is fixed but the query string changes every time one is minted.
    // remotePatterns matches on host and path and ignores the query, which is
    // what makes a rotating token workable here at all.
    remotePatterns: storageHostPatterns(),
  },

  // The dev-only indicator defaults to bottom-left, directly over the
  // sidebar's Log out button. Production is unaffected either way.
  devIndicators: {
    position: 'bottom-right',
  },
}

module.exports = nextConfig
