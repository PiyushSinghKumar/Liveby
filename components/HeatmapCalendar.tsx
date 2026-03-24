'use client'

import { useState } from 'react'
import { CheckinsData, StandardsData } from '@/lib/types'
import { scoreDay } from '@/lib/score'

interface Props {
  checkins: CheckinsData
  standards: StandardsData
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// scoreDay returns 0–10 (or null). Convert to 0–1 for internal use.
function dayPct(key: string, checkins: CheckinsData, standards: StandardsData): number | null {
  const s = scoreDay(key, checkins, standards)
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
  if (pct === null) return 'bg-white/5'
  if (pct === 0)   return 'bg-red-500/50'
  if (pct < 0.4)   return 'bg-orange-500/60'
  if (pct < 0.7)   return 'bg-yellow-500/60'
  if (pct < 1)     return 'bg-emerald-500/70'
  return 'bg-emerald-400'
}

function monthStats(year: number, month: number, checkins: CheckinsData, standards: StandardsData) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const todayKey = today.toISOString().split('T')[0]

  let tracked = 0
  let totalPct = 0
  let perfect = 0

  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKey(year, month, d)
    if (key > todayKey) break
    const pct = dayPct(key, checkins, standards)
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

export default function HeatmapCalendar({ checkins, standards }: Props) {
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

  const stats = monthStats(year, month, checkins, standards)

  // Selected day detail
  const selectedPct = selected ? dayPct(selected, checkins, standards) : null
  const selectedDate = selected ? new Date(selected + 'T00:00:00') : null
  const allIds = standards.categories.flatMap(c => c.standards.map(s => s.id))
  const selectedCheckins = selected ? checkins[selected] ?? {} : {}
  const selectedDone = allIds.filter(id => selectedCheckins[id]).length

  return (
    <div className="flex flex-col gap-4">
      {/* Month card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            ‹
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-white">{MONTHS[month]} {year}</h2>
            {stats.avg !== null && (
              <p className="text-xs text-white/40 mt-0.5">{stats.avg}% avg · {stats.perfect} perfect days</p>
            )}
          </div>
          <button
            onClick={nextMonth}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
              isCurrentMonth
                ? 'text-white/20 cursor-not-allowed'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
            disabled={isCurrentMonth}
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-white/30 uppercase tracking-wide py-1">
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
            const pct = isFuture ? null : dayPct(key, checkins, standards)
            const isSelected = selected === key

            return (
              <button
                key={i}
                onClick={() => !isFuture && setSelected(isSelected ? null : key)}
                disabled={isFuture}
                className={`
                  relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5
                  transition-all text-sm font-medium
                  ${isFuture ? 'text-white/15 cursor-default' : 'cursor-pointer'}
                  ${isSelected ? 'ring-2 ring-white/40 scale-105' : ''}
                  ${isToday ? 'ring-2 ring-indigo-400/70' : ''}
                  ${!isFuture ? pctToColor(pct) : ''}
                  ${!isFuture && !isSelected ? 'hover:scale-105 hover:ring-1 hover:ring-white/20' : ''}
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
            { dot: 'bg-white/10', label: 'No data' },
            { dot: 'bg-red-500/50', label: '0%' },
            { dot: 'bg-orange-500/60', label: '<40%' },
            { dot: 'bg-yellow-500/60', label: '<70%' },
            { dot: 'bg-emerald-500/70', label: '<100%' },
            { dot: 'bg-emerald-400', label: '100% ✓' },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${dot}`} />
              <span className="text-[10px] text-white/30">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day detail */}
      {selected && selectedDate && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">
                {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                {selectedPct === null
                  ? 'No check-in recorded'
                  : `${selectedDone} of ${allIds.length} standards completed — ${Math.round(selectedPct * 100)}%`}
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
                    <span className="text-xs text-white/50 w-24">{cat.label}</span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          cat.color === 'emerald' ? 'bg-emerald-500' :
                          cat.color === 'rose'    ? 'bg-rose-500' :
                          cat.color === 'blue'    ? 'bg-blue-500' :
                          cat.color === 'amber'   ? 'bg-amber-500' :
                          cat.color === 'purple'  ? 'bg-purple-500' :
                          cat.color === 'cyan'    ? 'bg-cyan-500' :
                          cat.color === 'pink'    ? 'bg-pink-500' :
                          cat.color === 'orange'  ? 'bg-orange-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${catPct * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40 w-12 text-right">{catDone}/{catIds.length}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
