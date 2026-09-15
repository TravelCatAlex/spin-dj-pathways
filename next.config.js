/** @type {import('next').NextConfig} */
const nextConfig = {
  // The dev-only indicator defaults to bottom-left, directly over the
  // sidebar's Log out button. Production is unaffected either way.
  devIndicators: {
    position: 'bottom-right',
  },
}

module.exports = nextConfig
