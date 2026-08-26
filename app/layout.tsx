export const metadata = {
  title: 'Spin DJ Pathways',
  description: 'DJ learning dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
