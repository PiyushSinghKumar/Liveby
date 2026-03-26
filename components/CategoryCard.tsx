'use client'

import { Category, DayCheckins } from '@/lib/types'
import { feedbackCheck, vibrateMedium } from '@/lib/haptic'

// Backward compat: map old named color IDs to hex
const LEGACY_COLORS: Record<string, string> = {
  emerald: '#10b981', rose: '#f43f5e', blue: '#3b82f6', amber: '#f59e0b',
  purple: '#a855f7', cyan: '#06b6d4', pink: '#ec4899', orange: '#f97316',
}

function toHex(color: string): string {
  return LEGACY_COLORS[color] ?? (color.startsWith('#') ? color : '#6366f1')
}

function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

interface Props {
  category: Category
  todayCheckins: DayCheckins
  streaks: Record<string, number>
  onToggle: (standardId: string, checked: boolean) => void
  onEditStandard: (categoryId: string, standardId: string, text: string) => void
  onAddStandard: (categoryId: string) => void
  onDeleteStandard: (categoryId: string, standardId: string) => void
  onDeleteCategory: (categoryId: string) => void
  onEditCategory: (categoryId: string) => void
}

export default function CategoryCard({
  category, todayCheckins, streaks,
  onToggle, onEditStandard, onAddStandard, onDeleteStandard, onDeleteCategory, onEditCategory,
}: Props) {
  const hex = toHex(category.color)
  const total = category.standards.length
  const done = category.standards.filter(s => todayCheckins[s.id]).length
  const w = (type?: 'hard' | 'soft') => type === 'soft' ? 1 : 5
  const totalW = category.standards.reduce((sum, s) => sum + w(s.type), 0)
  const doneW = category.standards.filter(s => todayCheckins[s.id]).reduce((sum, s) => sum + w(s.type), 0)
  const pct = totalW === 0 ? 0 : Math.round((doneW / totalW) * 100)

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{ backgroundColor: rgba(hex, 0.12), borderColor: rgba(hex, 0.5) }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <h2 className="text-lg font-bold" style={{ color: hex }}>{category.label}</h2>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: rgba(hex, 0.15), color: rgba(hex, 0.9) }}
          >
            {done}/{total}
          </span>
          <button
            onClick={() => onAddStandard(category.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-ink hover:bg-fill-2 active:bg-fill-3 transition text-sm"
            title="Add promise"
          >+</button>
          <button
            onClick={() => onEditCategory(category.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-4 hover:text-ink-2 hover:bg-fill-2 active:bg-fill-3 transition text-sm"
            title="Edit category"
          >✏️</button>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-4 hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 transition text-xs font-bold"
            title="Delete category"
          >✕</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-fill-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: hex }}
        />
      </div>

      {/* Promises list */}
      <ul className="flex flex-col gap-2">
        {category.standards.length === 0 && (
          <li className="text-ink-4 text-sm italic">No promises yet. Add one above.</li>
        )}
        {category.standards.map(standard => {
          const checked = !!todayCheckins[standard.id]
          const streak = streaks[standard.id] ?? 0
          return (
            <li key={standard.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={e => {
                  feedbackCheck(checked)
                  const next = e.target.checked
                  onToggle(standard.id, next)
                  if (next) {
                    const allDone = category.standards.every(s => s.id === standard.id ? true : !!todayCheckins[s.id])
                    if (allDone) vibrateMedium()
                  }
                }}
                className="mt-0.5 w-4 h-4 rounded cursor-pointer flex-shrink-0"
                style={{ accentColor: hex }}
              />
              <span
                className={`flex-1 text-sm leading-snug cursor-pointer select-none transition-all ${
                  checked ? 'line-through text-ink-4' : 'text-ink'
                }`}
                onClick={() => {
                  feedbackCheck(checked)
                  const next = !checked
                  onToggle(standard.id, next)
                  if (next) {
                    const allDone = category.standards.every(s => s.id === standard.id ? true : !!todayCheckins[s.id])
                    if (allDone) vibrateMedium()
                  }
                }}
              >
                {standard.text}
                {standard.type === 'soft' && (
                  <span className="ml-1.5 text-xs text-sky-400/70 font-medium">soft</span>
                )}
              </span>
              {streak > 0 && (
                <span className="text-xs text-orange-400 font-semibold flex-shrink-0" title={`${streak} day streak`}>
                  🔥{streak}
                </span>
              )}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEditStandard(category.id, standard.id, standard.text)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-ink hover:bg-fill-2 active:bg-fill-3 transition text-sm"
                  title="Edit"
                >✏️</button>
                <button
                  onClick={() => onDeleteStandard(category.id, standard.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-3 hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 transition text-sm font-bold"
                  title={standard.type === 'soft' ? 'Delete' : 'Delete (penalty applies)'}
                >✕</button>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Completion label */}
      {total > 0 && (
        <p className="text-xs font-medium text-right opacity-60" style={{ color: hex }}>
          {pct === 100 ? '✓ All done today' : `${pct}% today`}
        </p>
      )}
    </div>
  )
}
