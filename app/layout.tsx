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

// Browser extensions (Bitdefender's bis_skin_checked, Grammarly, and so on)
// inject attributes into the DOM before React hydrates, which React then
// reports as a mismatch. Suppressing on the root elements silences that
// class of false positive without hiding genuine mismatches in our own tree.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
