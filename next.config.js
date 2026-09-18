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
  },

  // The dev-only indicator defaults to bottom-left, directly over the
  // sidebar's Log out button. Production is unaffected either way.
  devIndicators: {
    position: 'bottom-right',
  },
}

module.exports = nextConfig
