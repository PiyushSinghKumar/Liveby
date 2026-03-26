'use client'

import { useRef, useState } from 'react'

interface Props {
  onDone: () => void
}

const SLIDES = [
  {
    icon: '👋',
    title: 'Hey, good to have you here.',
    body: 'Liveby is your personal space to show up for yourself every day. No pressure, no perfection, just small promises that add up to a life you\'re proud of.',
    detail: [
      'Install it like an app: tap the three-dot menu in Chrome and tap Add to Home Screen. It opens full-screen with no browser bar, just like a native app.',
      'Your data lives only on this device. If you switch devices, export a backup from Settings first.',
    ],
  },
  {
    icon: '💭',
    title: 'What do you actually want to do more of?',
    body: 'Exercise? Read? Call your family? Sleep on time? Pick the things that matter to you and turn them into promises to yourself.',
    detail: ['Start with 3 to 5 promises, not 20. It\'s easier to build up than to burn out on day one.'],
  },
  {
    icon: '📂',
    title: 'Group them however makes sense to you',
    body: 'Put your promises into areas of your life - Health, Work, Family, whatever fits. There are no right or wrong categories.',
    detail: ['Can you change them later? Absolutely. Add, remove, rename anytime. This is your space.'],
  },
  {
    icon: '❤️',
    title: 'Some promises mean more than others',
    body: 'Mark the ones you truly cannot compromise on as Hard. The nice-to-haves are Soft. Liveby weights them differently so your score reflects what actually matters.',
    detail: ['What happens if you break a hard promise? You can still remove it, but you\'ll choose whether it was fulfilled or given up. That honesty is the whole point.'],
  },
  {
    icon: '🌅',
    title: 'Each day is a fresh start',
    body: 'At the end of the day, just tick off what you did. No guilt about what you didn\'t - tomorrow is right there waiting.',
    detail: ['What if I miss a few days? Just come back. The app won\'t shame you. Your score will wait patiently.'],
  },
  {
    icon: '🌱',
    title: 'Your score is your story',
    body: 'It builds up quietly over time across every day you\'ve used the app. Good days lift it. Rough days barely move it.',
    detail: ['What\'s a good score? Any score you earned by actually showing up. Even a 6 today beats a 10 you never had.'],
  },
  {
    icon: '✨',
    title: 'Affirmations keep you grounded',
    body: 'Add a few lines you want to read every day, a reminder of who you are and what you\'re working toward. They sit right at the top of your home screen.',
    detail: ['Tap the affirmations area at the top of the app to add or edit them anytime.'],
  },
  {
    icon: '🔔',
    title: 'Let the app remind you',
    body: 'Turn on daily reminders so you don\'t forget to check in. You pick the times: morning, midday, evening, whatever works for you.',
    detail: ['Go to Settings (the gear icon) and turn on Daily reminder. Off by default.'],
  },
  {
    icon: '💾',
    title: 'Back up your data',
    body: 'Everything lives only on your device. If you clear your browser or switch devices, your data is gone unless you\'ve exported it.',
    detail: ['Go to Settings, open Your data, and tap Export backup. Do this regularly. It takes two seconds.'],
  },
]

export default function OnboardingModal({ onDone }: Props) {
  const [slide, setSlide] = useState(0)
  const [exiting, setExiting] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const isLast = slide === SLIDES.length - 1
  const s = SLIDES[slide]

  function next() {
    if (isLast) {
      finish()
    } else {
      setSlide(slide + 1)
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    touchStartX.current = null
    if (Math.abs(diff) < 50) return
    if (diff > 0) next()
    else if (slide > 0) setSlide(slide - 1)
  }

  function finish() {
    setExiting(true)
    setTimeout(onDone, 300)
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-bg transition-opacity duration-300 ${exiting ? 'opacity-0' : 'opacity-100'}`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 3rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Skip */}
      <div className="flex justify-end p-4">
        <button
          onClick={finish}
          className="text-sm text-ink-4 hover:text-ink-2 transition px-2 py-1"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div className="text-7xl">{s.icon}</div>

        <div className="flex flex-col gap-3 max-w-sm">
          <h2 className="text-2xl font-bold text-ink">{s.title}</h2>
          <p className="text-ink-2 leading-relaxed">{s.body}</p>
          {s.detail.length > 0 && (
            <div className="flex flex-col gap-2 border border-line rounded-xl px-4 py-3 bg-fill">
              {s.detail.map((line, i) => (
                <p key={i} className="text-sm text-ink-3 leading-relaxed">{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {isLast && (
        <div className="text-center flex flex-col gap-1.5 px-8">
          <p className="text-xs text-ink-4 uppercase tracking-widest">a note from your future self</p>
          <p className="text-sm text-ink-2 leading-relaxed italic">
            Thank you for starting. I know how this ends and it is worth every day you showed up.
          </p>
          <p className="text-xs text-ink-4 mt-1">built by Piyush Kumar Singh</p>
        </div>
      )}

      {/* Bottom nav */}
      <div className="flex flex-col items-center gap-5 px-8 pb-10">
        {/* Dots */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`rounded-full transition-all ${
                i === slide
                  ? 'w-6 h-2 bg-emerald-400'
                  : 'w-2 h-2 bg-fill-2 hover:bg-fill-3'
              }`}
            />
          ))}
        </div>

        {/* Back / Next */}
        <div className="flex gap-3 w-full max-w-sm">
          {slide > 0 && (
            <button
              onClick={() => setSlide(slide - 1)}
              className="flex-1 rounded-2xl border border-line text-ink-2 hover:text-ink hover:border-line-2 font-semibold py-4 text-base transition"
            >
              Back
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-semibold py-4 text-base transition"
          >
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
