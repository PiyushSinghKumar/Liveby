'use client'

import { useEffect, useState } from 'react'

type Mode = 'android' | 'ios' | null

export default function InstallBanner() {
  const [mode, setMode] = useState<Mode>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Running inside Capacitor native app - don't show
    if ((window as unknown as Record<string, unknown>).Capacitor) return
    // Already installed as PWA - don't show
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('liveby_install_dismissed')) return

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream
    const isAndroid = /android/i.test(navigator.userAgent)

    if (isIOS) {
      setMode('ios')
      return
    }

    if (isAndroid) {
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as Event & { prompt: () => void })
        setMode('android')
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('liveby_install_dismissed', 'true')
    setDismissed(true)
  }

  async function install() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    dismiss()
  }

  if (dismissed || !mode) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-indigo-500/30 bg-[#13132a] shadow-xl p-4 flex gap-3 items-start"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="text-2xl">📲</div>
      <div className="flex-1 flex flex-col gap-1">
        <p className="text-sm font-semibold text-white">Add Liveby to your home screen</p>
        {mode === 'android' && (
          <p className="text-xs text-white/50">Install the app for quick access and offline use.</p>
        )}
        {mode === 'ios' && (
          <p className="text-xs text-white/50">
            Tap the <span className="text-white/80 font-medium">Share</span> button below, then <span className="text-white/80 font-medium">Add to Home Screen</span>.
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        {mode === 'android' && (
          <button
            onClick={install}
            className="rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold px-3 py-1.5 transition"
          >
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          className="rounded-xl border border-white/10 text-white/40 hover:text-white/70 text-xs px-3 py-1.5 transition"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
