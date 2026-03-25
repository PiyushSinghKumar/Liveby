'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  onDone: () => void
}

type Platform = 'android' | 'ios' | 'desktop' | 'unknown'

function getPlatform(): Platform {
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  if (/macintosh|windows|linux/i.test(ua)) return 'desktop'
  return 'unknown'
}

export default function InstallChoice({ onDone }: Props) {
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [showIOSSteps, setShowIOSSteps] = useState(false)
  const [showAndroidHint, setShowAndroidHint] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const deferredPrompt = useRef<(Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null>(null)

  useEffect(() => {
    setPlatform(getPlatform())

    const handler = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as typeof deferredPrompt.current
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (platform === 'ios') {
      setShowIOSSteps(true)
      return
    }
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt()
      deferredPrompt.current = null
      onDone()
      return
    }
    // beforeinstallprompt hasn't fired yet — show Android manual hint
    if (platform === 'android') {
      setShowIOSSteps(false)
      setShowAndroidHint(true)
      return
    }
    onDone()
  }

  if (showAndroidHint) {
    return (
      <div
        className="fixed inset-0 z-60 flex flex-col items-center justify-between bg-[#0a0a14]"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 3rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)',
        }}
      >
        <div />
        <div className="flex flex-col items-center gap-8 px-8 text-center max-w-sm w-full">
          <div className="text-5xl">📲</div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white">Add to your home screen</h2>
            <p className="text-sm text-white/40">Using Chrome on Android</p>
          </div>
          <div className="flex flex-col gap-3 w-full text-left">
            {[
              { step: '1', text: <>Tap the <span className="text-white font-medium">three dots</span> menu in Chrome ⋮</> },
              { step: '2', text: <>Tap <span className="text-white font-medium">Add to Home screen</span></> },
              { step: '3', text: <>Tap <span className="text-white font-medium">Add</span> to confirm</> },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <span className="text-indigo-400 font-bold text-base w-4 flex-shrink-0">{step}</span>
                <p className="text-sm text-white/55 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full px-8 max-w-sm mx-auto">
          <button
            onClick={onDone}
            className="w-full rounded-2xl border border-white/15 text-white/50 hover:text-white/80 hover:border-white/30 font-semibold py-4 text-sm transition"
          >
            Continue in browser for now
          </button>
        </div>
      </div>
    )
  }

  if (showIOSSteps) {
    return (
      <div
        className="fixed inset-0 z-60 flex flex-col items-center justify-between bg-[#0a0a14]"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 3rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)',
        }}
      >
        <div />
        <div className="flex flex-col items-center gap-8 px-8 text-center max-w-sm w-full">
          <div className="text-5xl">📱</div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white">Add to your home screen</h2>
            <p className="text-sm text-white/40">Three quick steps in Safari</p>
          </div>
          <div className="flex flex-col gap-3 w-full text-left">
            {[
              { step: '1', text: <>Tap the <span className="text-white font-medium">Share</span> button at the bottom of Safari ⎋</> },
              { step: '2', text: <>Scroll and tap <span className="text-white font-medium">Add to Home Screen</span></> },
              { step: '3', text: <>Tap <span className="text-white font-medium">Add</span> in the top right</> },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <span className="text-indigo-400 font-bold text-base w-4 flex-shrink-0">{step}</span>
                <p className="text-sm text-white/55 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full px-8 max-w-sm mx-auto">
          <button
            onClick={onDone}
            className="w-full rounded-2xl border border-white/15 text-white/50 hover:text-white/80 hover:border-white/30 font-semibold py-4 text-sm transition"
          >
            Continue in browser for now
          </button>
        </div>
      </div>
    )
  }

  // Always show install option on mobile; on desktop only when the browser supports it
  const showInstallOption = platform === 'ios' || platform === 'android' || canInstall

  return (
    <div
      className="fixed inset-0 z-60 flex flex-col items-center justify-between bg-[#0a0a14]"
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 3rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)',
      }}
    >
      <div />

      <div className="flex flex-col items-center gap-8 px-8 text-center max-w-sm w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="Liveby" className="w-16 h-16 drop-shadow-[0_0_16px_rgba(99,102,241,0.4)]" />

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-white">How would you like to use Liveby?</h1>
          <p className="text-sm text-white/35">You can always change your mind later</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {showInstallOption && (
            <button
              onClick={handleInstall}
              className="w-full rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 hover:border-indigo-400/70 p-5 text-left transition flex items-start gap-4"
            >
              <span className="text-2xl">📲</span>
              <div className="flex flex-col gap-1">
                <p className="text-white font-semibold text-sm">Install on my device</p>
                <p className="text-white/40 text-xs leading-relaxed">Works offline. Opens like a real app. No app store needed.</p>
              </div>
            </button>
          )}

          <button
            onClick={onDone}
            className="w-full rounded-2xl bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 p-5 text-left transition flex items-start gap-4"
          >
            <span className="text-2xl">🌐</span>
            <div className="flex flex-col gap-1">
              <p className="text-white font-semibold text-sm">Continue in browser</p>
              <p className="text-white/40 text-xs leading-relaxed">Use it right here. No install required.</p>
            </div>
          </button>
        </div>
      </div>

      <div />
    </div>
  )
}
