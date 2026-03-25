'use client'

import { useState } from 'react'
import { saveProfile } from '@/lib/storage'

interface Props {
  onDone: (name: string) => void
}

export default function ProfileSetup({ onDone }: Props) {
  const [name, setName] = useState('')

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return
    saveProfile({ name: trimmed })
    onDone(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg px-8 gap-8"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 3rem)', paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
    >
      <div className="flex flex-col items-center gap-3 text-center max-w-sm">
        <div className="text-6xl">🙂</div>
        <h2 className="text-2xl font-bold text-ink">What should we call you?</h2>
        <p className="text-ink-2 text-sm leading-relaxed">
          Your future self wants to know your name.
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Your name"
          autoFocus
          className="w-full rounded-2xl bg-raised border border-line text-ink placeholder-ink-3 px-4 py-4 text-base outline-none focus:border-indigo-400 transition"
        />
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold py-4 text-base transition"
        >
          {"Let's go"}
        </button>
        <button
          onClick={() => onDone('')}
          className="text-sm text-ink-4 hover:text-ink-2 transition text-center"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}
