export interface Standard {
  id: string
  text: string
  type?: 'hard' | 'soft'   // hard=weight 2, soft=weight 1. Defaults to hard if absent.
  createdAt?: string        // ISO date "YYYY-MM-DD" — used to exclude from pre-creation history
}

export interface Category {
  id: string
  label: string
  color: string
  icon: string
  standards: Standard[]
}

export interface StandardsData {
  categories: Category[]
}

// checkins.json: { "2024-01-15": { "h1": true, "h2": false, ... } }
export type DayCheckins = Record<string, boolean>
export type CheckinsData = Record<string, DayCheckins>

export interface Affirmation {
  id: string
  text: string
  category: string
  createdAt: string
}
