'use client'

import { Category, DayCheckins } from '@/lib/types'

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; badge: string; check: string; bar: string }> = {
  emerald: { bg: 'bg-emerald-950/40', border: 'border-emerald-700/40', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300', check: 'accent-emerald-500', bar: 'bg-emerald-500' },
  rose:    { bg: 'bg-rose-950/40',    border: 'border-rose-700/40',    text: 'text-rose-400',    badge: 'bg-rose-500/20 text-rose-300',       check: 'accent-rose-500',    bar: 'bg-rose-500' },
  blue:    { bg: 'bg-blue-950/40',    border: 'border-blue-700/40',    text: 'text-blue-400',    badge: 'bg-blue-500/20 text-blue-300',       check: 'accent-blue-500',    bar: 'bg-blue-500' },
  amber:   { bg: 'bg-amber-950/40',   border: 'border-amber-700/40',   text: 'text-amber-400',   badge: 'bg-amber-500/20 text-amber-300',     check: 'accent-amber-500',   bar: 'bg-amber-500' },
  purple:  { bg: 'bg-purple-950/40',  border: 'border-purple-700/40',  text: 'text-purple-400',  badge: 'bg-purple-500/20 text-purple-300',   check: 'accent-purple-500',  bar: 'bg-purple-500' },
  cyan:    { bg: 'bg-cyan-950/40',    border: 'border-cyan-700/40',    text: 'text-cyan-400',    badge: 'bg-cyan-500/20 text-cyan-300',       check: 'accent-cyan-500',    bar: 'bg-cyan-500' },
  pink:    { bg: 'bg-pink-950/40',    border: 'border-pink-700/40',    text: 'text-pink-400',    badge: 'bg-pink-500/20 text-pink-300',       check: 'accent-pink-500',    bar: 'bg-pink-500' },
  orange:  { bg: 'bg-orange-950/40',  border: 'border-orange-700/40',  text: 'text-orange-400',  badge: 'bg-orange-500/20 text-orange-300',   check: 'accent-orange-500',  bar: 'bg-orange-500' },
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
}

export default function CategoryCard({
  category,
  todayCheckins,
  streaks,
  onToggle,
  onEditStandard,
  onAddStandard,
  onDeleteStandard,
  onDeleteCategory,
}: Props) {
  const colors = COLOR_MAP[category.color] ?? COLOR_MAP.blue
  const total = category.standards.length
  const done = category.standards.filter(s => todayCheckins[s.id]).length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className={`rounded-2xl border ${colors.bg} ${colors.border} p-5 flex flex-col gap-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <h2 className={`text-lg font-bold ${colors.text}`}>{category.label}</h2>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
            {done}/{total}
          </span>
          <button
            onClick={() => onAddStandard(category.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 active:bg-white/20 transition text-sm"
            title="Add promise"
          >+</button>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 transition text-xs font-bold"
            title="Delete category"
          >✕</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Standards list */}
      <ul className="flex flex-col gap-2">
        {category.standards.length === 0 && (
          <li className="text-white/30 text-sm italic">No promises yet. Add one above.</li>
        )}
        {category.standards.map(standard => {
          const checked = !!todayCheckins[standard.id]
          const streak = streaks[standard.id] ?? 0
          return (
            <li key={standard.id} className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={e => onToggle(standard.id, e.target.checked)}
                className={`mt-0.5 w-4 h-4 rounded cursor-pointer flex-shrink-0 ${colors.check}`}
              />
              <span
                className={`flex-1 text-sm leading-snug cursor-pointer select-none transition-all ${
                  checked ? 'line-through text-white/30' : 'text-white/80'
                }`}
                onClick={() => onToggle(standard.id, !checked)}
              >
                {standard.text}
              </span>
              {streak > 0 && (
                <span className="text-xs text-orange-400 font-semibold flex-shrink-0" title={`${streak} day streak`}>
                  🔥{streak}
                </span>
              )}
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => onEditStandard(category.id, standard.id, standard.text)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 active:bg-white/20 transition text-sm"
                  title="Edit"
                >✏️</button>
                <button
                  onClick={() => onDeleteStandard(category.id, standard.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 transition text-sm font-bold"
                  title="Delete"
                >✕</button>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Completion label */}
      {total > 0 && (
        <p className={`text-xs font-medium text-right ${colors.text} opacity-60`}>
          {pct === 100 ? '✓ All done today' : `${pct}% today`}
        </p>
      )}
    </div>
  )
}
