import { StandardsData, CheckinsData, Affirmation } from './types'

const KEYS = {
  standards: 'liveby_standards',
  checkins: 'liveby_checkins',
  affirmations: 'liveby_affirmations',
  penalties: 'liveby_penalties',
  onboarded: 'liveby_onboarded',
  autoBackup: 'liveby_auto_backup',
  lastBackup: 'liveby_last_backup',
  profile: 'liveby_profile',
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

export function hasOnboarded(): boolean {
  return localStorage.getItem(KEYS.onboarded) === 'true'
}

export function setOnboarded() {
  localStorage.setItem(KEYS.onboarded, 'true')
}

export function exportData(): string {
  return JSON.stringify({
    version: 1,
    exportedAt: new Date().toISOString(),
    standards: getStandards(),
    checkins: getCheckins(),
    affirmations: getAffirmations(),
    penalties: getPenalties(),
  }, null, 2)
}

export function importData(json: string): { ok: boolean; error?: string } {
  try {
    const data = JSON.parse(json)
    if (!data.standards || !data.checkins) return { ok: false, error: 'Invalid backup file.' }
    saveStandards(data.standards)
    saveCheckins(data.checkins)
    if (data.affirmations) saveAffirmations(data.affirmations)
    if (data.penalties) savePenalties(data.penalties)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not read the file. Make sure it is a valid Liveby backup.' }
  }
}

export type BackupInterval = 'daily' | 'weekly' | 'monthly'

export interface AutoBackupSettings {
  enabled: boolean
  interval: BackupInterval
}

export function getAutoBackupSettings(): AutoBackupSettings {
  return get(KEYS.autoBackup, { enabled: false, interval: 'weekly' as BackupInterval })
}

export function saveAutoBackupSettings(s: AutoBackupSettings) {
  set(KEYS.autoBackup, s)
}

export function getLastBackupDate(): string | null {
  return localStorage.getItem(KEYS.lastBackup)
}

export function setLastBackupDate(date: string) {
  localStorage.setItem(KEYS.lastBackup, date)
}

export interface Profile {
  name: string
  photo?: string  // base64 data URL
}

export function getProfile(): Profile {
  return get(KEYS.profile, { name: '' })
}

export function saveProfile(p: Profile) {
  set(KEYS.profile, p)
}

export function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}
