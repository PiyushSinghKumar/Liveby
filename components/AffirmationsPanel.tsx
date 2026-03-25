'use client'

import { useState } from 'react'
import { Affirmation } from '@/lib/types'

interface Props {
  affirmations: Affirmation[]
  onAdd: (text: string) => void
  onEdit: (id: string, text: string) => void
  onDelete: (id: string) => void
}

export default function AffirmationsPanel({ affirmations, onAdd, onEdit, onDelete }: Props) {
  const [text, setText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  function startEdit(a: Affirmation) {
    setEditingId(a.id)
    setText(a.text)
  }

  function cancelEdit() {
    setEditingId(null)
    setText('')
  }

  function submit() {
    const trimmed = text.trim()
    if (!trimmed) return
    if (editingId) {
      onEdit(editingId, trimmed)
      setEditingId(null)
    } else {
      onAdd(trimmed)
    }
    setText('')
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-white/35 font-medium uppercase tracking-wide">Your Affirmations</p>

      {/* Input */}
      <div className="flex flex-col gap-2">
        <textarea
          className={`w-full bg-white/5 border rounded-xl p-3 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none transition ${editingId ? 'border-indigo-500/50 focus:border-indigo-400' : 'border-white/10 focus:border-white/30'}`}
          rows={2}
          placeholder="Write something you want to remind yourself of..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
        />
        <div className="flex gap-2">
          {editingId && (
            <button
              onClick={cancelEdit}
              className="px-4 py-1.5 border border-white/10 text-white/40 hover:text-white/70 text-sm font-semibold rounded-lg transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition"
          >
            {editingId ? 'Save' : 'Add'}
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
              className={`flex items-start gap-3 rounded-xl border p-3 transition ${editingId === a.id ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/10 bg-white/5'}`}
            >
              <span className="flex-1 text-sm leading-snug text-white/70 italic">"{a.text}"</span>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => editingId === a.id ? cancelEdit() : startEdit(a)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25 hover:text-white/70 hover:bg-white/10 transition text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25 hover:text-rose-400 hover:bg-rose-500/10 transition text-sm font-bold"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
