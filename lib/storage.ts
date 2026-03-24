import { StandardsData, CheckinsData, Affirmation } from './types'

const KEYS = {
  standards: 'liveby_standards',
  checkins: 'liveby_checkins',
  affirmations: 'liveby_affirmations',
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

export function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}
