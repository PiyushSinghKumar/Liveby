'use client'

import { useState, lazy, Suspense } from 'react'
import type { EmojiClickData } from 'emoji-picker-react'

const EmojiPicker = lazy(() => import('emoji-picker-react'))

export const AVAILABLE_COLORS = [
  { id: 'emerald', label: 'Green',  swatch: 'bg-emerald-500' },
  { id: 'rose',    label: 'Red',    swatch: 'bg-rose-500' },
  { id: 'blue',    label: 'Blue',   swatch: 'bg-blue-500' },
  { id: 'amber',   label: 'Amber',  swatch: 'bg-amber-500' },
  { id: 'purple',  label: 'Purple', swatch: 'bg-purple-500' },
  { id: 'cyan',    label: 'Cyan',   swatch: 'bg-cyan-500' },
  { id: 'pink',    label: 'Pink',   swatch: 'bg-pink-500' },
  { id: 'orange',  label: 'Orange', swatch: 'bg-orange-500' },
]

export const SUGGESTED_CATEGORIES = [
  { label: 'Health',        icon: '💪', color: 'emerald' },
  { label: 'Relationship',  icon: '❤️', color: 'rose'    },
  { label: 'Career',        icon: '🚀', color: 'blue'    },
  { label: 'Money',         icon: '💰', color: 'amber'   },
  { label: 'Mindset',       icon: '🧠', color: 'purple'  },
  { label: 'Spirituality',  icon: '🙏', color: 'cyan'    },
  { label: 'Learning',      icon: '📚', color: 'pink'    },
  { label: 'Family',        icon: '🏡', color: 'orange'  },
  { label: 'Fitness',       icon: '🔥', color: 'rose'    },
  { label: 'Sleep',         icon: '🌙', color: 'purple'  },
  { label: 'Social',        icon: '🎯', color: 'cyan'    },
  { label: 'Creativity',    icon: '🎨', color: 'pink'    },
]

interface Props {
  open: boolean
  existingLabels?: string[]
  onSave: (label: string, icon: string, color: string) => void
  onClose: () => void
}

export default function CategoryModal({ open, existingLabels = [], onSave, onClose }: Props) {
  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('purple')
  const [pickerOpen, setPickerOpen] = useState(false)

  if (!open) return null

  function save() {
    const trimmed = label.trim()
    if (!trimmed) return
    onSave(trimmed, icon, color)
    setLabel('')
    setIcon('🎯')
    setColor('purple')
    setPickerOpen(false)
    onClose()
  }

  function applySuggestion(s: typeof SUGGESTED_CATEGORIES[0]) {
    setLabel(s.label)
    setIcon(s.icon)
    setColor(s.color)
    setPickerOpen(false)
  }

  function onEmojiClick(data: EmojiClickData) {
    setIcon(data.emoji)
    setPickerOpen(false)
  }

  const available = SUGGESTED_CATEGORIES.filter(
    s => !existingLabels.map(l => l.toLowerCase()).includes(s.label.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#1a1a2e] border border-white/15 rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
        <h3 className="text-base font-bold text-white/90">New Category</h3>

        {/* Suggestions */}
        {available.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-white/35 font-medium uppercase tracking-wide">Quick add</p>
            <div className="flex flex-wrap gap-2">
              {available.map(s => (
                <button
                  key={s.label}
                  onClick={() => applySuggestion(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                    label === s.label
                      ? 'bg-white/15 border-white/30 text-white'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/25'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 font-medium uppercase tracking-wide">Name</label>
          <input
            autoFocus
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-white/30 transition"
            placeholder="e.g. Spirituality"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save() }}
          />
        </div>

        {/* Icon picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 font-medium uppercase tracking-wide">Icon</label>
          <div className="relative">
            <button
              onClick={() => setPickerOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 hover:border-white/25 rounded-xl transition w-full text-left"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm text-white/50">Tap to change</span>
            </button>

            {pickerOpen && (
              <div className="absolute left-0 top-full mt-2 z-10">
                <Suspense fallback={
                  <div className="w-64 h-40 flex items-center justify-center bg-[#1a1a2e] rounded-xl border border-white/10 text-white/30 text-sm">
                    Loading...
                  </div>
                }>
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme={'dark' as any}
                    width={300}
                    height={380}
                    searchPlaceholder="Search emoji..."
                    lazyLoadEmojis
                  />
                </Suspense>
              </div>
            )}
          </div>
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-white/40 font-medium uppercase tracking-wide">Color</label>
          <div className="flex gap-2 flex-wrap">
            {AVAILABLE_COLORS.map(c => (
              <button
                key={c.id}
                onClick={() => setColor(c.id)}
                className={`w-7 h-7 rounded-full ${c.swatch} transition ${
                  color === c.id ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-[#1a1a2e] scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-white/50 hover:text-white/80 border border-white/10 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!label.trim()}
            className="px-4 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
