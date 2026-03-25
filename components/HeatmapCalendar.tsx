'use client'

import { useState } from 'react'
import { CheckinsData, StandardsData } from '@/lib/types'
import { scoreDay } from '@/lib/score'

const LEGACY_COLORS: Record<string, string> = {
  emerald: '#10b981', rose: '#f43f5e', blue: '#3b82f6', amber: '#f59e0b',
  purple: '#a855f7', cyan: '#06b6d4', pink: '#ec4899', orange: '#f97316',
}

interface Props {
  checkins: CheckinsData
  standards: StandardsData
  penalties?: Record<string, number>
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// scoreDay returns 0–10 (or null). Convert to 0–1 for internal use.
function dayPct(key: string, checkins: CheckinsData, standards: StandardsData, penalties?: Record<string, number>): number | null {
  const s = scoreDay(key, checkins, standards, penalties)
  return s === null ? null : s / 10
}

function pctToColor(pct: number | null): string {
  if (pct === null) return ''
  if (pct === 0)    return 'bg-red-900/50 text-red-300/60'
  if (pct < 0.4)   return 'bg-orange-900/50 text-orange-300/70'
  if (pct < 0.7)   return 'bg-yellow-900/50 text-yellow-300/70'
  if (pct < 1)     return 'bg-emerald-900/60 text-emerald-300/80'
  return 'bg-emerald-500/30 text-emerald-300 ring-1 ring-emerald-500/50'
}

function pctToDot(pct: number | null): string {
  if (pct === null) return 'bg-fill'
  if (pct === 0)   return 'bg-red-500/50'
  if (pct < 0.4)   return 'bg-orange-500/60'
  if (pct < 0.7)   return 'bg-yellow-500/60'
  if (pct < 1)     return 'bg-emerald-500/70'
  return 'bg-emerald-400'
}

function monthStats(year: number, month: number, checkins: CheckinsData, standards: StandardsData, penalties?: Record<string, number>) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]

  let tracked = 0
  let totalPct = 0
  let perfect = 0

  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKey(year, month, d)
    if (key > todayKey) break
    const pct = dayPct(key, checkins, standards, penalties)
    if (pct !== null) {
      tracked++
      totalPct += pct
      if (pct === 1) perfect++
    }
  }

  return {
    tracked,
    avg: tracked > 0 ? Math.round((totalPct / tracked) * 100) : null,
    perfect,
  }
}

export default function HeatmapCalendar({ checkins, standards, penalties }: Props) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const todayKey = now.toISOString().split('T')[0]

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelected(null)
  }

  function nextMonth() {
    const nextIsAfterNow = year === now.getFullYear() && month >= now.getMonth()
    if (nextIsAfterNow) return
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  const stats = monthStats(year, month, checkins, standards, penalties)

  // Selected day detail
  const selectedPct = selected ? dayPct(selected, checkins, standards, penalties) : null
  const selectedDate = selected ? new Date(selected + 'T00:00:00') : null
  const allIds = standards.categories.flatMap(c => c.standards.map(s => s.id))
  const selectedCheckins = selected ? checkins[selected] ?? {} : {}
  const selectedDone = allIds.filter(id => selectedCheckins[id]).length

  return (
    <div className="flex flex-col gap-4">
      {/* Month card */}
      <div className="rounded-2xl border border-line bg-fill p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-2 hover:text-ink hover:bg-fill-2 transition"
          >
            ‹
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-ink">{MONTHS[month]} {year}</h2>
            {stats.avg !== null && (
              <p className="text-xs text-ink-3 mt-0.5">{stats.avg}% avg · {stats.perfect} perfect days</p>
            )}
          </div>
          <button
            onClick={nextMonth}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
              isCurrentMonth
                ? 'text-ink-4 cursor-not-allowed'
                : 'text-ink-2 hover:text-ink hover:bg-fill-2'
            }`}
            disabled={isCurrentMonth}
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-ink-4 uppercase tracking-wide py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const key = dateKey(year, month, day)
            const isFuture = key > todayKey
            const isToday = key === todayKey
            const pct = isFuture ? null : dayPct(key, checkins, standards, penalties)
            const isSelected = selected === key

            return (
              <button
                key={i}
                onClick={() => setSelected(isSelected ? null : key)}
                className={`
                  relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                  transition-all text-sm font-medium cursor-pointer
                  ${isFuture ? 'text-ink-4 hover:bg-fill' : ''}
                  ${isSelected ? 'ring-2 ring-ink-2 scale-105' : ''}
                  ${isToday ? 'ring-2 ring-indigo-400/70' : ''}
                  ${!isFuture ? pctToColor(pct) : ''}
                  ${!isSelected ? 'hover:scale-105 hover:ring-1 hover:ring-line-2' : ''}
                `}
              >
                <span className="leading-none">{day}</span>
                {!isFuture && pct !== null && (
                  <div className={`w-1 h-1 rounded-full ${pctToDot(pct)}`} />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 justify-center flex-wrap">
          {[
            { dot: 'bg-fill-2', label: 'No data' },
            { dot: 'bg-red-500/50', label: '0%' },
            { dot: 'bg-orange-500/60', label: '<40%' },
            { dot: 'bg-yellow-500/60', label: '<70%' },
            { dot: 'bg-emerald-500/70', label: '<100%' },
            { dot: 'bg-emerald-400', label: '100% ✓' },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-[10px] text-ink-4">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && selectedDate && (() => {
        const isFutureSelected = selected > todayKey
        const catColor = (c: string) => LEGACY_COLORS[c] ?? (c.startsWith('#') ? c : '#6366f1')

        if (isFutureSelected) {
          // Show planned promises for future date
          const activeCats = standards.categories
            .map(cat => ({ ...cat, standards: cat.standards.filter(s => !s.createdAt || s.createdAt <= selected) }))
            .filter(cat => cat.standards.length > 0)
          return (
            <div className="rounded-2xl border border-line bg-fill p-5 animate-in fade-in duration-200">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-ink">
                  {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs text-indigo-400/70 mt-0.5">
                  Upcoming - {activeCats.reduce((n, c) => n + c.standards.length, 0)} promises planned
                </p>
              </div>
              {activeCats.length === 0
                ? <p className="text-xs text-ink-4 italic">No promises scheduled yet.</p>
                : (
                  <div className="flex flex-col gap-3">
                    {activeCats.map(cat => (
                      <div key={cat.id}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-sm">{cat.icon}</span>
                          <span className="text-xs font-semibold" style={{ color: catColor(cat.color) }}>{cat.label}</span>
                        </div>
                        <ul className="flex flex-col gap-1 pl-5">
                          {cat.standards.map(s => (
                            <li key={s.id} className="text-xs text-ink-2 flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-fill-2 flex-shrink-0" />
                              {s.text}
                              {s.type === 'soft' && <span className="text-sky-400/60">soft</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )
        }

        return (
          <div className="rounded-2xl border border-line bg-fill p-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-ink">
                  {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs text-ink-3 mt-0.5">
                  {selectedPct === null
                    ? 'No check-in recorded'
                    : `${selectedDone} of ${allIds.length} promises completed - ${Math.round(selectedPct * 100)}%`}
                </p>
              </div>
              {selectedPct !== null && (
                <div className={`text-2xl font-bold ${
                  selectedPct === 1 ? 'text-emerald-400' :
                  selectedPct >= 0.7 ? 'text-emerald-500' :
                  selectedPct >= 0.4 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {Math.round(selectedPct * 100)}%
                </div>
              )}
            </div>
            {selectedPct !== null && (
              <div className="flex flex-col gap-2">
                {standards.categories.map(cat => {
                  const catIds = cat.standards.map(s => s.id)
                  const catDone = catIds.filter(id => selectedCheckins[id]).length
                  const catPct = catIds.length > 0 ? catDone / catIds.length : 0
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <span className="text-sm w-4">{cat.icon}</span>
                      <span className="text-xs text-ink-2 w-24">{cat.label}</span>
                      <div className="flex-1 h-1.5 bg-fill-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${catPct * 100}%`, backgroundColor: catColor(cat.color) }}
                        />
                      </div>
                      <span className="text-xs text-ink-3 w-12 text-right">{catDone}/{catIds.length}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}
