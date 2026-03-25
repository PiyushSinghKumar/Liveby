'use client'

interface Props {
  onStart: () => void
}

export default function WelcomeScreen({ onStart }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-bg"
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 3rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 2.5rem)',
      }}
    >
      {/* Top spacer */}
      <div />

      {/* Center content */}
      <div className="flex flex-col items-center gap-8 px-8 text-center">
        {/* Logo */}
        <div className="w-24 h-24 drop-shadow-[0_0_24px_rgba(99,102,241,0.4)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="Liveby" className="w-full h-full" />
        </div>

        {/* Name + tagline */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-black tracking-tight text-ink">Liveby</h1>
          <p className="text-lg text-ink-2 leading-snug max-w-xs">
            Small promises to yourself.<br />Kept every day.
          </p>
        </div>

        {/* Value props */}
        <div className="flex flex-col gap-2.5 max-w-xs w-full">
          {[
            { icon: '🎯', text: 'Set promises across areas of your life' },
            { icon: '📈', text: 'Watch your score grow over time' },
            { icon: '🔒', text: 'Everything stays private on your device' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-left">
              <span className="text-lg w-7 flex-shrink-0 text-center">{icon}</span>
              <span className="text-sm text-ink-3">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 w-full px-8 max-w-sm mx-auto">
        <button
          onClick={onStart}
          className="w-full rounded-2xl bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-white font-semibold py-4 text-base transition"
        >
          Get started
        </button>
        <p className="text-xs text-ink-4">Free. No account needed.</p>
      </div>
    </div>
  )
}
