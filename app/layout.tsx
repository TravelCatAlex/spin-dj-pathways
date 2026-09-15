import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

// Self-hosted at build time by next/font — no runtime CDN request, no FOUT.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
})

export const metadata = {
  title: 'Spin DJ Pathways',
  description: 'DJ learning dashboard',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  )
}
