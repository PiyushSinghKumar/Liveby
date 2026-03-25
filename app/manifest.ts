import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Liveby',
    short_name: 'Liveby',
    description: 'Live by your standards',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d14',
    theme_color: '#6366f1',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
