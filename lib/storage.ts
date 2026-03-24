import { StandardsData, CheckinsData, Affirmation } from './types'

const KEYS = {
  standards: 'liveby_standards',
  checkins: 'liveby_checkins',
  affirmations: 'liveby_affirmations',
  penalties: 'liveby_penalties',
}

const DEFAULT_STANDARDS: StandardsData = {
  categories: [],
}

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStandards(): StandardsData {
  return get(KEYS.standards, DEFAULT_STANDARDS)
}

export function saveStandards(data: StandardsData) {
  set(KEYS.standards, data)
}

export function getCheckins(): CheckinsData {
  return get(KEYS.checkins, {})
}

export function saveCheckins(data: CheckinsData) {
  set(KEYS.checkins, data)
}

export function getAffirmations(): Affirmation[] {
  return get(KEYS.affirmations, [])
}

export function saveAffirmations(data: Affirmation[]) {
  set(KEYS.affirmations, data)
}

// penalties: { "2024-01-15": 2 } means -2 points on that day (from deleted hard promises)
export function getPenalties(): Record<string, number> {
  return get(KEYS.penalties, {})
}

export function savePenalties(data: Record<string, number>) {
  set(KEYS.penalties, data)
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}
