'use client'

import { useState } from 'react'
import { Affirmation } from '@/lib/types'

interface Props {
  affirmations: Affirmation[]
  categoryLabels: string[]   // from user's actual categories
  onAdd: (text: string, category: string) => void
  onDelete: (id: string) => void
}

export default function AffirmationsPanel({ affirmations, categoryLabels, onAdd, onDelete }: Props) {
  const categories = categoryLabels.length > 0 ? categoryLabels : ['General']
  const [text, setText] = useState('')
  const [category, setCategory] = useState(categories[0])

  function submit() {
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed, category)
    setText('')
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-white/35 font-medium uppercase tracking-wide">Your Affirmations</p>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-white/30 transition"
          rows={2}
          placeholder="Write something you want to remind yourself of..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
        />
        <div className="flex gap-2">
          {categories.length > 1 && (
            <select
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/70 focus:outline-none"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c} className="bg-[#1a1a2e]">{c}</option>
              ))}
            </select>
          )}
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* List */}
      {affirmations.length === 0 ? (
        <p className="text-sm text-white/25 italic">Nothing added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {affirmations.map(a => (
            <li
              key={a.id}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
            >
              <span className="flex-1 text-sm leading-snug text-white/70 italic">"{a.text}"</span>
              <button
                onClick={() => onDelete(a.id)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25 hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 transition text-sm font-bold flex-shrink-0"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
