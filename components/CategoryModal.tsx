'use client'

import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import type { EmojiClickData } from 'emoji-picker-react'

const EmojiPicker = lazy(() => import('emoji-picker-react'))

export const SUGGESTED_CATEGORIES = [
  { label: 'Health',        icon: '💪', color: '#10b981' },
  { label: 'Relationship',  icon: '❤️', color: '#f43f5e' },
  { label: 'Career',        icon: '🚀', color: '#3b82f6' },
  { label: 'Money',         icon: '💰', color: '#f59e0b' },
  { label: 'Mindset',       icon: '🧠', color: '#a855f7' },
  { label: 'Spirituality',  icon: '🙏', color: '#06b6d4' },
  { label: 'Learning',      icon: '📚', color: '#ec4899' },
  { label: 'Family',        icon: '🏡', color: '#f97316' },
  { label: 'Fitness',       icon: '🔥', color: '#ef4444' },
  { label: 'Sleep',         icon: '🌙', color: '#8b5cf6' },
  { label: 'Social',        icon: '🎯', color: '#14b8a6' },
  { label: 'Creativity',    icon: '🎨', color: '#84cc16' },
]

const PRESET_COLORS = [
  '#ef4444','#f97316','#f59e0b','#84cc16',
  '#10b981','#06b6d4','#3b82f6','#6366f1',
  '#a855f7','#ec4899','#f43f5e','#14b8a6',
  '#ffffff','#94a3b8','#64748b','#1e293b',
]

interface Props {
  open: boolean
  existingLabels?: string[]
  initialValues?: { label: string; icon: string; color: string }
  onSave: (label: string, icon: string, color: string) => void
  onClose: () => void
}

export default function CategoryModal({ open, existingLabels = [], initialValues, onSave, onClose }: Props) {
  const [label, setLabel] = useState(initialValues?.label ?? '')
  const [icon, setIcon] = useState(initialValues?.icon ?? '🎯')
  const [color, setColor] = useState(initialValues?.color ?? '#6366f1')
  const [pickerOpen, setPickerOpen] = useState(false)
  const colorInputRef = useRef<HTMLInputElement>(null)

  const isEdit = !!initialValues

  useEffect(() => {
    if (open) {
      setLabel(initialValues?.label ?? '')
      setIcon(initialValues?.icon ?? '🎯')
      setColor(initialValues?.color ?? '#6366f1')
      setPickerOpen(false)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null

  function save() {
    const trimmed = label.trim()
    if (!trimmed) return
    onSave(trimmed, icon, color)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-card border border-line rounded-2xl p-6 flex flex-col gap-5 shadow-2xl">
        <h3 className="text-base font-bold text-ink">{isEdit ? 'Edit Category' : 'New Category'}</h3>

        {/* Suggestions - only when creating */}
        {!isEdit && available.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-ink-3 font-medium uppercase tracking-wide">Quick add</p>
            <div className="flex flex-wrap gap-2">
              {available.map(s => (
                <button
                  key={s.label}
                  onClick={() => applySuggestion(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition ${
                    label === s.label
                      ? 'bg-raised border-line-2 text-ink'
                      : 'bg-fill border-line text-ink-2 hover:text-ink hover:border-line-2'
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
          <label className="text-xs text-ink-3 font-medium uppercase tracking-wide">Name</label>
          <input
            autoFocus
            className="bg-fill border border-line rounded-xl px-3 py-2 text-sm text-ink placeholder-ink-4 focus:outline-none focus:border-line-2 transition"
            placeholder="e.g. Spirituality"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') save() }}
          />
        </div>

        {/* Icon picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-ink-3 font-medium uppercase tracking-wide">Icon</label>
          <div className="relative">
            <button
              onClick={() => setPickerOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-2 bg-fill border border-line hover:border-line-2 rounded-xl transition w-full text-left"
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-sm text-ink-2">Tap to change</span>
            </button>
            {pickerOpen && (
              <div className="absolute left-0 top-full mt-2 z-10">
                <Suspense fallback={
                  <div className="w-64 h-40 flex items-center justify-center bg-card rounded-xl border border-line text-ink-4 text-sm">Loading...</div>
                }>
                  <EmojiPicker onEmojiClick={onEmojiClick} theme={'dark' as any} width={300} height={380} searchPlaceholder="Search emoji..." lazyLoadEmojis />
                </Suspense>
              </div>
            )}
          </div>
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-ink-3 font-medium uppercase tracking-wide">Color</label>
          {/* Preset swatches */}
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition ${
                  color === c ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-card scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              />
            ))}
            {/* Custom color picker */}
            <button
              onClick={() => colorInputRef.current?.click()}
              className="w-7 h-7 rounded-full border-2 border-dashed border-line-2 hover:border-line-2 flex items-center justify-center text-ink-3 hover:text-ink-2 transition text-xs"
              title="Custom color"
            >＋</button>
            <input
              ref={colorInputRef}
              type="color"
              value={color.startsWith('#') ? color : '#6366f1'}
              onChange={e => setColor(e.target.value)}
              className="sr-only"
            />
          </div>
          {/* Current color preview */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-ink-3 font-mono">{color}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-sm text-ink-2 hover:text-ink border border-line rounded-lg transition">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={!label.trim()}
            className="px-4 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            {isEdit ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
