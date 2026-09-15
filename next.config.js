/** @type {import('next').NextConfig} */
const nextConfig = {
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
