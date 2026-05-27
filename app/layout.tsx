import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Forge',
  description: 'Meal and workout tracker',
  applicationName: 'Forge',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Forge',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/forge-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icons/forge-apple-touch-icon.svg', type: 'image/svg+xml' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
