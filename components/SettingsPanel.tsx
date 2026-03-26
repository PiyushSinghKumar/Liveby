'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
  getReminderSettings, saveReminderSettings,
  requestPermission, applyNativeReminder, ReminderSettings,
} from '@/lib/reminder'
import { getProfile } from '@/lib/storage'

const FONTS = [
  { id: 'default', label: 'Default', preview: 'Aa' },
  { id: 'rounded', label: 'Rounded', preview: 'Aa' },
  { id: 'mono', label: 'Mono', preview: 'Aa' },
  { id: 'serif', label: 'Serif', preview: 'Aa' },
]

const SIZES = [
  { id: 'sm', label: 'S' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'L' },
]

function getSavedFont() {
  if (typeof window === 'undefined') return 'default'
  return localStorage.getItem('liveby_font') ?? 'default'
}

function getSavedSize() {
  if (typeof window === 'undefined') return 'md'
  return localStorage.getItem('liveby_size') ?? 'md'
}

function applyFont(font: string) {
  const html = document.documentElement
  html.classList.remove('font-rounded', 'font-mono', 'font-serif')
  if (font !== 'default') html.classList.add(`font-${font}`)
  localStorage.setItem('liveby_font', font)
}

function applySize(size: string) {
  const html = document.documentElement
  html.classList.remove('size-sm', 'size-md', 'size-lg')
  html.classList.add(`size-${size}`)
  localStorage.setItem('liveby_size', size)
}

interface Props {
  onClose: () => void
}

export default function SettingsPanel({ onClose }: Props) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [font, setFont] = useState('default')
  const [size, setSize] = useState('md')
  const [reminder, setReminder] = useState<ReminderSettings>(getReminderSettings)
  const [reminderPermDenied, setReminderPermDenied] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setMounted(true)
    setFont(getSavedFont())
    setSize(getSavedSize())
    const isCapacitor = !!(window as unknown as Record<string, unknown>).Capacitor
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(isCapacitor || standalone)
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleReminderToggle() {
    const turningOn = !reminder.enabled
    const updated = { ...reminder, enabled: turningOn }
    setReminder(updated)
    saveReminderSettings(updated)
    if (turningOn) {
      const granted = await requestPermission()
      setReminderPermDenied(!granted)
      if (granted) applyNativeReminder(updated, getProfile().name || undefined)
    } else {
      setReminderPermDenied(false)
      applyNativeReminder(updated)
    }
  }

  function handleReminderTimes(times: string[]) {
    const updated = { ...reminder, times }
    setReminder(updated)
    saveReminderSettings(updated)
    if (updated.enabled) applyNativeReminder(updated, getProfile().name || undefined)
  }

  function addTime() {
    handleReminderTimes([...reminder.times, '08:00'])
  }

  function removeTime(i: number) {
    handleReminderTimes(reminder.times.filter((_, idx) => idx !== i))
  }

  function updateTime(i: number, val: string) {
    const times = reminder.times.map((t, idx) => idx === i ? val : t)
    handleReminderTimes(times)
  }

  function handleFont(f: string) {
    setFont(f)
    applyFont(f)
  }

  function handleSize(s: string) {
    setSize(s)
    applySize(s)
  }

  if (!mounted) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl flex flex-col"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-fill-2" />
        </div>

        <div className="flex flex-col px-5 pb-2 gap-5 overflow-y-auto max-h-[80vh]">
          <h2 className="text-base font-bold text-ink pt-2">Settings</h2>

          {/* Theme */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-ink-3 font-medium uppercase tracking-wide">Theme</p>
            <div className="flex gap-2">
              {[
                { id: 'light', label: '☀️ Light' },
                { id: 'dark', label: '🌙 Dark' },
                { id: 'system', label: '⚙️ System' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition ${
                    theme === t.id
                      ? 'bg-indigo-500/15 border-indigo-400/50 text-indigo-400'
                      : 'bg-fill border-line text-ink-3 hover:text-ink-2'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-ink-3 font-medium uppercase tracking-wide">Font</p>
            <div className="flex gap-2">
              {FONTS.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleFont(f.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm border transition flex flex-col items-center gap-0.5 ${
                    font === f.id
                      ? 'bg-indigo-500/15 border-indigo-400/50 text-indigo-400'
                      : 'bg-fill border-line text-ink-3 hover:text-ink-2'
                  }`}
                  style={{
                    fontFamily:
                      f.id === 'rounded' ? "var(--font-rounded), ui-rounded, 'Hiragino Maru Gothic ProN', sans-serif" :
                      f.id === 'mono' ? "ui-monospace, 'Cascadia Code', monospace" :
                      f.id === 'serif' ? "ui-serif, Georgia, serif" : undefined,
                  }}
                >
                  <span className="text-base font-semibold">{f.preview}</span>
                  <span className="text-[10px]">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-ink-3 font-medium uppercase tracking-wide">Text size</p>
            <div className="flex gap-2">
              {SIZES.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSize(s.id)}
                  className={`flex-1 py-2.5 rounded-xl border transition font-semibold ${
                    size === s.id
                      ? 'bg-indigo-500/15 border-indigo-400/50 text-indigo-400'
                      : 'bg-fill border-line text-ink-3 hover:text-ink-2'
                  }`}
                  style={{
                    fontSize: s.id === 'sm' ? '12px' : s.id === 'lg' ? '18px' : '15px',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-ink-3 font-medium uppercase tracking-wide">Daily reminder</p>
            <div className="flex items-center justify-between bg-fill border border-line rounded-2xl px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-ink">Check-in reminder</p>
                <p className="text-xs text-ink-3">Notifies you if you haven't checked in</p>
              </div>
              <button
                onClick={handleReminderToggle}
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${reminder.enabled ? 'bg-indigo-500' : 'bg-fill-3'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${reminder.enabled ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>
            {reminderPermDenied && (
              <p className="text-xs text-orange-400 px-1">Notifications are blocked. Allow them in your browser settings for this to work.</p>
            )}
            {reminder.enabled && (
              <div className="flex flex-col gap-2">
                {reminder.times.map((t, i) => (
                  <div key={i} className="flex items-center justify-between bg-fill border border-line rounded-2xl px-4 py-3">
                    <p className="text-sm text-ink-2">Reminder {i + 1}</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={t}
                        onChange={e => updateTime(i, e.target.value)}
                        className="bg-transparent text-sm font-semibold text-ink outline-none"
                      />
                      {reminder.times.length > 1 && (
                        <button onClick={() => removeTime(i)} className="text-ink-4 hover:text-red-400 transition text-base leading-none">×</button>
                      )}
                    </div>
                  </div>
                ))}
                {reminder.times.length < 6 && (
                  <button
                    onClick={addTime}
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition text-left px-1"
                  >
                    + Add reminder time
                  </button>
                )}
              </div>
            )}
          </div>

          {!isStandalone && (
            <div className="flex flex-col gap-2 bg-fill border border-line rounded-2xl px-4 py-3 text-sm text-ink-2">
              <p className="font-medium text-ink">Install app</p>
              {isIOS ? (
                <>
                  <p>Open this page in <span className="font-medium text-ink">Safari</span>, tap the Share button, then <span className="font-medium text-ink">Add to Home Screen</span>.</p>
                  <p className="text-ink-3 text-xs">This browser does not support installing apps on iPhone. Safari does.</p>
                </>
              ) : (
                <>
                  <p>Tap the <span className="font-medium text-ink">three dots</span> menu ⋮ → <span className="font-medium text-ink">Add to Home screen</span></p>
                  <p className="text-ink-3 text-xs">Use Chrome or Brave on Android.</p>
                </>
              )}
            </div>
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
