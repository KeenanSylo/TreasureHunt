import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TreasureHunt - Find Hidden Gems Before Everyone Else',
  description: 'AI-powered visual search that finds undervalued treasures hiding in plain sight.',
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
