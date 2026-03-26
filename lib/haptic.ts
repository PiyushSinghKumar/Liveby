let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  return audioCtx
}

function isSoundEnabled(): boolean {
  return localStorage.getItem('liveby_sound') !== 'false'
}

export function setSoundEnabled(v: boolean) {
  localStorage.setItem('liveby_sound', v ? 'true' : 'false')
}

export function getSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true
  return isSoundEnabled()
}

/** Soft ascending tick — checking something off */
export function playCheck() {
  if (!isSoundEnabled()) return
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08)
  gain.gain.setValueAtTime(0.18, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.12)
}

/** Soft descending tick — unchecking */
export function playUncheck() {
  if (!isSoundEnabled()) return
  const ctx = getCtx()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(500, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08)
  gain.gain.setValueAtTime(0.12, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.1)
}

/** Light vibration — works on Android Chrome PWA */
export function vibrateLight() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10)
  }
}

/** Slightly stronger vibration for completing a full category */
export function vibrateMedium() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([15, 30, 15])
  }
}

export function feedbackCheck(wasChecked: boolean) {
  vibrateLight()
  if (wasChecked) playUncheck()
  else playCheck()
}
