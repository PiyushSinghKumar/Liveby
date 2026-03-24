import type { Metadata, Viewport } from 'next'
import './globals.css'
import config from '@/lib/config'

export const metadata: Metadata = {
  title: config.appName,
  description: config.appDescription,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-[#0d0d14] text-[#e8e8f0] antialiased">
        <div className="border-t-2 border-indigo-500/40 bg-[#0d0d14]" style={{ paddingTop: 'env(safe-area-inset-top)' }} />
        {children}
      </body>
    </html>
  )
}
