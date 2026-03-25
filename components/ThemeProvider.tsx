'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" themes={['light', 'dark']} defaultTheme="dark" enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}
