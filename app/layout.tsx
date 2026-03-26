import type { Metadata, Viewport } from 'next'
import './globals.css'
import config from '@/lib/config'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: config.appName,
  description: config.appDescription,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: config.appName,
  },
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
      <body className="min-h-full antialiased">
        {/* Restore font/size prefs before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var font = localStorage.getItem('liveby_font');
            var size = localStorage.getItem('liveby_size') || 'md';
            if (font && font !== 'default') document.documentElement.classList.add('font-' + font);
            document.documentElement.classList.add('size-' + size);
          })();
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
          window.addEventListener('beforeinstallprompt', function(e) {
            window._deferredInstallPrompt = e;
          });
        `}} />
        <ThemeProvider>
          <div className="border-t-2 border-indigo-500/40 bg-bg" style={{ paddingTop: 'env(safe-area-inset-top)' }} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
