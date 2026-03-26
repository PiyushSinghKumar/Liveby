'use client'

import { useMemo } from 'react'
import { CheckinsData, StandardsData } from '@/lib/types'
import { scoreDay } from '@/lib/score'

interface Props {
  checkins: CheckinsData
  standards: StandardsData
  penalties?: Record<string, number>
  onClose: () => void
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function scoreColor(score: number | null) {
  if (score === null) return 'text-ink-4'
  if (score >= 7.5) return 'text-emerald-400'
  if (score >= 5) return 'text-yellow-400'
  if (score >= 2.5) return 'text-orange-400'
  return 'text-red-400'
}

function barColor(score: number | null) {
  if (score === null) return 'bg-fill-2'
  if (score >= 7.5) return 'bg-emerald-400'
  if (score >= 5) return 'bg-yellow-400'
  if (score >= 2.5) return 'bg-orange-400'
  return 'bg-red-400'
}

export default function WeeklySummary({ checkins, standards, penalties, onClose }: Props) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      const key = d.toISOString().split('T')[0]
      const score = scoreDay(key, checkins, standards, penalties)
      return { key, label: DAY_LABELS[d.getDay()], day: d.getDate(), score }
    })
  }, [checkins, standards, penalties])

  const checkedDays = days.filter(d => d.score !== null)
  const avgScore = checkedDays.length > 0
    ? checkedDays.reduce((s, d) => s + d.score!, 0) / checkedDays.length
    : null

  const promiseStats = useMemo(() => {
    const stats: Record<string, { text: string; done: number; total: number }> = {}
    for (const cat of standards.categories) {
      for (const s of cat.standards) {
        stats[s.id] = { text: s.text, done: 0, total: 0 }
      }
    }
    for (const { key } of days) {
      const dayData = checkins[key]
      if (!dayData) continue
      for (const id of Object.keys(stats)) {
        stats[id].total++
        if (dayData[id]) stats[id].done++
      }
    }
    return Object.values(stats).filter(s => s.total > 0)
  }, [days, checkins, standards])

  const sorted = [...promiseStats].sort((a, b) => (b.done / b.total) - (a.done / a.total))
  const best = sorted[0] ?? null
  const worst = sorted[sorted.length - 1] ?? null
  const showWorst = worst && worst !== best && worst.done < worst.total

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl flex flex-col"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-fill-2" />
        </div>

        <div className="flex flex-col px-5 pb-2 gap-5 overflow-y-auto max-h-[85vh]">
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-base font-bold text-ink">Last 7 days</h2>
            {avgScore !== null && (
              <span className={`text-sm font-semibold ${scoreColor(avgScore)}`}>
                avg {avgScore.toFixed(1)}/10
              </span>
            )}
          </div>

          {checkedDays.length === 0 ? (
            <p className="text-sm text-ink-4 text-center py-4">No check-ins in the last 7 days.</p>
          ) : (
            <>
              {/* Bar chart */}
              <div className="flex gap-2 items-end h-20">
                {days.map(({ key, label, day, score }) => {
                  const height = score !== null ? Math.max(6, (score / 10) * 72) : 6
                  return (
                    <div key={key} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex-1 w-full flex items-end">
                        <div
                          className={`w-full rounded-t-md transition-all ${barColor(score)}`}
                          style={{ height: `${height}px` }}
                        />
                      </div>
                      <span className="text-[9px] text-ink-4 leading-none">{label}</span>
                      <span className="text-[9px] text-ink-3 leading-none">{day}</span>
                    </div>
                  )
                })}
              </div>

              {/* Per-day scores */}
              <div className="flex flex-col gap-2">
                {days.map(({ key, label, day, score }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-ink-2">{label} {day}</span>
                    <span className={`text-sm font-semibold ${scoreColor(score)}`}>
                      {score !== null ? `${score.toFixed(1)}/10` : 'no check-in'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promise highlights */}
              {promiseStats.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-ink-3 font-medium uppercase tracking-wide">Promise highlights</p>
                  {best && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
                      <p className="text-xs text-emerald-400 font-medium mb-0.5">Most consistent</p>
                      <p className="text-sm text-ink">{best.text}</p>
                      <p className="text-xs text-ink-3 mt-0.5">{best.done} of {best.total} days</p>
                    </div>
                  )}
                  {showWorst && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
                      <p className="text-xs text-red-400 font-medium mb-0.5">Needs attention</p>
                      <p className="text-sm text-ink">{worst!.text}</p>
                      <p className="text-xs text-ink-3 mt-0.5">{worst!.done} of {worst!.total} days</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-line text-ink-4 font-medium py-4 transition text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}
