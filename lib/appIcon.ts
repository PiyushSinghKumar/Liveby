import { registerPlugin } from '@capacitor/core'

interface AppIconPlugin {
  setScoreIcon(options: { score: number }): Promise<void>
}

const AppIcon = registerPlugin<AppIconPlugin>('AppIcon')

let pendingScore: number | null = null

// Only switch the launcher icon when the app goes to background.
// Switching while the app is active crashes the task because Android
// sees the alias that launched it get disabled mid-session.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && pendingScore !== null) {
      const score = pendingScore
      pendingScore = null
      AppIcon.setScoreIcon({ score }).catch(() => {})
    }
  })
}

export function updateAppIcon(score: number) {
  pendingScore = score
}
