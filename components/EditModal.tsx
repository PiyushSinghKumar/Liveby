'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  open: boolean
  title: string
  initialValue?: string
  initialType?: 'hard' | 'soft'
  placeholder?: string
  categories?: { id: string; label: string; icon: string }[]
  currentCategoryId?: string
  onSave: (value: string, type: 'hard' | 'soft') => void
  onMove?: (targetCategoryId: string) => void
  onClose: () => void
}

export default function EditModal({ open, title, initialValue = '', initialType = 'hard', placeholder, categories, currentCategoryId, onSave, onMove, onClose }: Props) {
  const [value, setValue] = useState(initialValue)
  const [type, setType] = useState<'hard' | 'soft'>(initialType)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setValue(initialValue)
    setType(initialType)
    if (open) setTimeout(() => ref.current?.focus(), 50)
  }, [open, initialValue, initialType])

  if (!open) return null

  function save() {
    if (!value.trim()) return
    onSave(value.trim(), type)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-line rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        <textarea
          ref={ref}
          className="w-full bg-fill border border-line rounded-xl p-3 text-sm text-ink placeholder-ink-4 resize-none focus:outline-none focus:border-line-2 transition"
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() } }}
        />

        {/* Hard / Soft toggle */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-ink-3 font-medium uppercase tracking-wide">Promise weight</p>
          <div className="flex gap-2">
            <button
              onClick={() => setType('hard')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                type === 'hard'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-fill border-line text-ink-3 hover:text-ink-2'
              }`}
            >
              🔒 Hard
            </button>
            <button
              onClick={() => setType('soft')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${
                type === 'soft'
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-300'
                  : 'bg-fill border-line text-ink-3 hover:text-ink-2'
              }`}
            >
              🌊 Soft
            </button>
          </div>
          <p className="text-xs text-ink-4">
            {type === 'hard' ? 'Hard promises count 5× toward your score.' : 'Soft promises count 1× - good habits, lower stakes.'}
          </p>
        </div>

        {/* Move to another category */}
        {onMove && categories && categories.filter(c => c.id !== currentCategoryId).length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-ink-3 font-medium uppercase tracking-wide">Move to</p>
            <div className="flex flex-wrap gap-2">
              {categories.filter(c => c.id !== currentCategoryId).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { onMove(cat.id); onClose() }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fill hover:bg-fill-2 border border-line hover:border-line-2 text-ink-2 hover:text-ink text-xs font-medium transition"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-ink-2 hover:text-ink border border-line rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
