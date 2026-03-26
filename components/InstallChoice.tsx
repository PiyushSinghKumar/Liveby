'use client'

import { useEffect, useState } from 'react'

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

function isIOSSafari(): boolean {
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios|opios|edgios/i.test(ua)
}

function supportsAndroidInstall(): boolean {
  const ua = navigator.userAgent
  // All Chromium-based browsers on Android include "Chrome/" in the UA
  // Firefox does not, so this correctly excludes it
  return /android/i.test(ua) && /chrome\/\d/i.test(ua)
}

export default function InstallChoice({ onDone }: Props) {
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [showIOSSteps, setShowIOSSteps] = useState(false)
  const [showAndroidHint, setShowAndroidHint] = useState(false)
  const [needsChrome, setNeedsChrome] = useState(false)
  const [needsSafari, setNeedsSafari] = useState(false)

  useEffect(() => {
    const plat = getPlatform()
    setPlatform(plat)
    if (plat === 'android' && !supportsAndroidInstall()) setNeedsChrome(true)
    if (plat === 'ios' && !isIOSSafari()) setNeedsSafari(true)
  }, [])

  function handleInstall() {
    if (platform === 'ios') {
      setShowIOSSteps(true)
      return
    }
    if (platform === 'android') {
      setShowAndroidHint(true)
      return
    }
    onDone()
  }

  if (showAndroidHint) {
    const steps = needsChrome
      ? [
          { step: '1', text: <>Open <span className="text-ink font-medium">Chrome or Brave</span> on your device</> },
          { step: '2', text: <>Go to <span className="text-ink font-medium select-all">liveby.vercel.app</span></> },
          { step: '3', text: <>Tap the <span className="text-ink font-medium">three dots</span> menu → <span className="text-ink font-medium">Add to Home screen</span></> },
        ]
      : [
          { step: '1', text: <>Tap the <span className="text-ink font-medium">three dots</span> menu ⋮</> },
          { step: '2', text: <>Tap <span className="text-ink font-medium">Add to Home screen</span></> },
          { step: '3', text: <>Tap <span className="text-ink font-medium">Add</span> to confirm</> },
        ]

    return (
      <div
        className="fixed inset-0 z-60 flex flex-col items-center justify-between bg-bg"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 3rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)',
        }}
      >
        <div />
        <div className="flex flex-col items-center gap-8 px-8 text-center max-w-sm w-full">
          <div className="text-5xl">📲</div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-ink">
              {needsChrome ? 'Open in Chrome to install' : 'Add to your home screen'}
            </h2>
            <p className="text-sm text-ink-3">
              {needsChrome ? 'This browser does not support installing apps. Chrome or Brave do.' : 'Takes 3 seconds, works like a real app.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full text-left">
            {steps.map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4 bg-fill border border-line rounded-2xl px-4 py-3">
                <span className="text-indigo-400 font-bold text-base w-4 flex-shrink-0">{step}</span>
                <p className="text-sm text-ink-2 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full px-8 max-w-sm mx-auto">
          <button
            onClick={onDone}
            className="w-full rounded-2xl border border-line text-ink-2 hover:text-ink hover:border-line-2 font-semibold py-4 text-sm transition"
          >
            Continue in browser for now
          </button>
        </div>
      </div>
    )
  }

  if (showIOSSteps) {
    const steps = needsSafari
      ? [
          { step: '1', text: <>Copy this link: <span className="text-ink font-medium select-all">liveby.vercel.app</span></> },
          { step: '2', text: <>Open <span className="text-ink font-medium">Safari</span> and paste it. Only Safari can install web apps on iPhone.</> },
          { step: '3', text: <>Tap the <span className="text-ink font-medium">Share</span> button at the bottom, then <span className="text-ink font-medium">Add to Home Screen</span>.</> },
        ]
      : [
          { step: '1', text: <>Tap the <span className="text-ink font-medium">Share</span> button at the bottom of Safari ⎋</> },
          { step: '2', text: <>Scroll down and tap <span className="text-ink font-medium">Add to Home Screen</span></> },
          { step: '3', text: <>Tap <span className="text-ink font-medium">Add</span> in the top right</> },
        ]

    return (
      <div
        className="fixed inset-0 z-60 flex flex-col items-center justify-between bg-bg"
        style={{
          paddingTop: 'max(env(safe-area-inset-top), 3rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)',
        }}
      >
        <div />
        <div className="flex flex-col items-center gap-8 px-8 text-center max-w-sm w-full">
          <div className="text-5xl">📱</div>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-ink">
              {needsSafari ? 'Open in Safari to install' : 'Add to your home screen'}
            </h2>
            <p className="text-sm text-ink-3">
              {needsSafari ? 'This browser does not support installing apps on iPhone. Safari does.' : 'Three quick steps in Safari.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full text-left">
            {steps.map(({ step, text }) => (
              <div key={step} className="flex items-center gap-4 bg-fill border border-line rounded-2xl px-4 py-3">
                <span className="text-indigo-400 font-bold text-base w-4 flex-shrink-0">{step}</span>
                <p className="text-sm text-ink-2 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full px-8 max-w-sm mx-auto">
          <button
            onClick={onDone}
            className="w-full rounded-2xl border border-line text-ink-2 hover:text-ink hover:border-line-2 font-semibold py-4 text-sm transition"
          >
            Continue in browser for now
          </button>
        </div>
      </div>
    )
  }

  const showInstallOption = platform === 'ios' || platform === 'android'

  return (
    <div
      className="fixed inset-0 z-60 flex flex-col items-center justify-between bg-bg"
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
          <h1 className="text-2xl font-bold text-ink">How would you like to use Liveby?</h1>
          <p className="text-sm text-ink-3">You can always change your mind later</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {showInstallOption && (
            <button
              onClick={handleInstall}
              className="w-full rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 hover:border-indigo-400/70 p-5 text-left transition flex items-start gap-4"
            >
              <span className="text-2xl">📲</span>
              <div className="flex flex-col gap-1">
                <p className="text-ink font-semibold text-sm">Install on my device</p>
                <p className="text-ink-3 text-xs leading-relaxed">Works offline. Opens like a real app. No app store needed.</p>
              </div>
            </button>
          )}

          <button
            onClick={onDone}
            className="w-full rounded-2xl bg-fill hover:bg-fill-2 border border-line hover:border-line-2 p-5 text-left transition flex items-start gap-4"
          >
            <span className="text-2xl">🌐</span>
            <div className="flex flex-col gap-1">
              <p className="text-ink font-semibold text-sm">Continue in browser</p>
              <p className="text-ink-3 text-xs leading-relaxed">Use it right here. No install required.</p>
            </div>
          </button>
        </div>
      </div>

      <div />
    </div>
  )
}
