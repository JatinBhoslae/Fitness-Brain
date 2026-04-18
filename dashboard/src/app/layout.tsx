import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fitness Brain Dashboard',
  description: 'Real-time health statistics sync',
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
