import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

export interface ReminderSettings {
  enabled: boolean
  times: string[] // ["HH:MM", ...]
}

const KEY = 'liveby_reminder'
const FIRED_KEY = 'liveby_reminder_fired'
const BASE_ID = 1001

const DEFAULT_TIMES = ['09:00', '13:00', '17:00', '21:00']

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { enabled: false, times: DEFAULT_TIMES }
    const parsed = JSON.parse(raw)
    // Migrate old single-time format
    if (parsed.time && !parsed.times) {
      return { enabled: parsed.enabled ?? false, times: [parsed.time] }
    }
    return { enabled: parsed.enabled ?? false, times: parsed.times ?? DEFAULT_TIMES }
  } catch {
    return { enabled: false, times: DEFAULT_TIMES }
  }
}

export function saveReminderSettings(s: ReminderSettings) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

interface FiredRecord { date: string; times: string[] }

function getFiredRecord(): FiredRecord {
  try {
    return JSON.parse(localStorage.getItem(FIRED_KEY) ?? '{}')
  } catch {
    return { date: '', times: [] }
  }
}

function setFiredRecord(r: FiredRecord) {
  localStorage.setItem(FIRED_KEY, JSON.stringify(r))
}

export function markReminderFired(time: string, todayDate: string) {
  const rec = getFiredRecord()
  if (rec.date !== todayDate) {
    setFiredRecord({ date: todayDate, times: [time] })
  } else {
    setFiredRecord({ ...rec, times: [...new Set([...rec.times, time])] })
  }
}

export async function requestPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  }
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function messageForTime(time: string, name?: string): { title: string; body: string } {
  const [h] = time.split(':').map(Number)
  const greeting = name ? `Hey ${name}` : 'Hey'
  let body: string
  if (h < 10) body = `${greeting}, start your day strong — check in now 🌅`
  else if (h < 14) body = `${greeting}, how's your day going? Don't forget to check in 💪`
  else if (h < 18) body = `${greeting}, still time to make today count — check in 🎯`
  else body = `${greeting}, don't let today close without checking in 🌙`
  return { title: 'Liveby', body }
}

export async function applyNativeReminder(settings: ReminderSettings, name?: string) {
  if (!Capacitor.isNativePlatform()) return

  // Cancel all existing reminder notifications
  const cancelIds = Array.from({ length: 20 }, (_, i) => ({ id: BASE_ID + i }))
  await LocalNotifications.cancel({ notifications: cancelIds })

  if (!settings.enabled || settings.times.length === 0) return

  const notifications = settings.times.map((time, i) => {
    const [h, m] = time.split(':').map(Number)
    const { title, body } = messageForTime(time, name)
    return {
      id: BASE_ID + i,
      title,
      body,
      schedule: { on: { hour: h, minute: m }, repeats: true },
      smallIcon: 'ic_launcher_foreground',
    }
  })

  await LocalNotifications.schedule({ notifications })
}

export function showNotification(time: string, name?: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const { title, body } = messageForTime(time, name)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png' })
    })
  } else {
    new Notification(title, { body, icon: '/icon-192.png' })
  }
}

/** Returns the time slot that should fire now, if any (web fallback). */
export function checkShouldFireReminder(settings: ReminderSettings, todayDate: string): string | null {
  if (!settings.enabled) return null
  const rec = getFiredRecord()
  const firedToday = rec.date === todayDate ? rec.times : []
  const now = new Date()
  for (const time of settings.times) {
    if (firedToday.includes(time)) continue
    const [h, m] = time.split(':').map(Number)
    const target = new Date()
    target.setHours(h, m, 0, 0)
    if (now >= target) return time
  }
  return null
}
