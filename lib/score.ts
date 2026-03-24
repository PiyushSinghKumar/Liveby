import { CheckinsData, DayCheckins, StandardsData } from './types'

/**
 * Returns the promises that were active (created on or before dateKey) for each category.
 * Promises without createdAt are treated as always existing.
 */
function activeCategoriesForDay(dateKey: string, standards: StandardsData) {
  return standards.categories
    .map(cat => ({
      ...cat,
      standards: cat.standards.filter(s => !s.createdAt || s.createdAt <= dateKey),
    }))
    .filter(cat => cat.standards.length > 0)
}

function weight(type?: 'hard' | 'soft') { return type === 'soft' ? 1 : 5 }

function catScore(promises: StandardsData['categories'][number]['standards'], done: (id: string) => boolean) {
  const total = promises.reduce((sum, s) => sum + weight(s.type), 0)
  if (total === 0) return 0
  const doneW = promises.filter(s => done(s.id)).reduce((sum, s) => sum + weight(s.type), 0)
  return doneW / total
}

/**
 * Score a single day. Returns 0–10 or null if no checkin data exists for that day.
 *
 * Weighting: each category counts equally. Within a category, hard promises (weight 5)
 * count 5× as much as soft promises (weight 1). Missing type defaults to hard.
 *
 * Historical accuracy: only promises that existed on dateKey are included,
 * so adding new promises later does not retroactively hurt old scores.
 */
export function scoreDay(
  dateKey: string,
  checkins: CheckinsData,
  standards: StandardsData,
  penalties?: Record<string, number>,
): number | null {
  const dayData = checkins[dateKey]
  if (!dayData) return null

  const cats = activeCategoriesForDay(dateKey, standards)
  if (cats.length === 0) return null

  const scores = cats.map(cat => catScore(cat.standards, id => !!dayData[id]))
  const base = (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
  return Math.max(0, base - (penalties?.[dateKey] ?? 0))
}

/**
 * Score today using the current checkins map (before it is persisted).
 * Uses the same equal-category weighting.
 * Returns 0–10 (never null — 0 when nothing done or no promises set up).
 */
export function scoreTodayLive(
  todayCheckins: DayCheckins,
  standards: StandardsData,
  todayKey: string,
  penalties?: Record<string, number>,
): number {
  const cats = activeCategoriesForDay(todayKey, standards)
  if (cats.length === 0) return 0

  const scores = cats.map(cat => catScore(cat.standards, id => !!todayCheckins[id]))
  const base = (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
  return Math.max(0, base - (penalties?.[todayKey] ?? 0))
}

/**
 * 7-day rolling average. Only days that have checkin data are counted.
 */
export function rollingAvg(
  checkins: CheckinsData,
  standards: StandardsData,
  days = 7,
  penalties?: Record<string, number>,
): number | null {
  const scores: number[] = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const s = scoreDay(key, checkins, standards, penalties)
    if (s !== null) scores.push(s)
  }
  return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
}

/**
 * Per-day sparkline data for the last `days` days (oldest first).
 */
export function sparklineScores(
  checkins: CheckinsData,
  standards: StandardsData,
  days = 7,
  penalties?: Record<string, number>,
): (number | null)[] {
  const today = new Date()
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (days - 1 - i))
    const key = d.toISOString().split('T')[0]
    return scoreDay(key, checkins, standards, penalties)
  })
}
