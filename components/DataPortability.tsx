'use client'

import { useEffect, useRef, useState } from 'react'
import { exportData, importData, getAutoBackupSettings, saveAutoBackupSettings, getLastBackupDate, setLastBackupDate, BackupInterval, AutoBackupSettings } from '@/lib/storage'
import { Share } from '@capacitor/share'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

interface Props {
  onImported: () => void
}

const INTERVAL_DAYS: Record<BackupInterval, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
}

const INTERVAL_LABELS: Record<BackupInterval, string> = {
  daily: 'Every day',
  weekly: 'Every week',
  monthly: 'Every month',
}

async function runExport(silent = false): Promise<void> {
  const filename = `liveby-backup-${new Date().toISOString().split('T')[0]}.json`
  const data = exportData()
  const blob = new Blob([data], { type: 'application/json' })
  const file = new File([blob], filename, { type: 'application/json' })
  const isCapacitor = !!(window as unknown as Record<string, unknown>).Capacitor

  if (isCapacitor) {
    if (silent) {
      await Filesystem.writeFile({
        path: filename,
        data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      })
    } else {
      await Share.share({ title: 'Liveby Backup', text: data, dialogTitle: 'Save your backup' })
    }
    return
  }

  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Liveby Backup' }); return } catch { /* cancelled */ }
    return
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function useAutoBackup() {
  useEffect(() => {
    const settings = getAutoBackupSettings()
    if (!settings.enabled) return

    const last = getLastBackupDate()
    const daysSince = last
      ? Math.floor((Date.now() - new Date(last).getTime()) / 86_400_000)
      : Infinity

    if (daysSince >= INTERVAL_DAYS[settings.interval]) {
      runExport(true)
        .then(() => setLastBackupDate(new Date().toISOString().split('T')[0]))
        .catch(() => {})
    }
  }, [])
}

export default function DataPortability({ onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [settings, setSettings] = useState<AutoBackupSettings>(() => getAutoBackupSettings())
  const lastBackup = getLastBackupDate()

  function updateSettings(patch: Partial<AutoBackupSettings>) {
    const updated = { ...settings, ...patch }
    setSettings(updated)
    saveAutoBackupSettings(updated)
  }

  async function handleExport() {
    try {
      await runExport()
      setLastBackupDate(new Date().toISOString().split('T')[0])
      setLastBackupDate(new Date().toISOString().split('T')[0])
    } catch (e) {
      setMsg({ text: 'Export failed. Please try again.', ok: false })
    }
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const result = importData(ev.target?.result as string)
      if (result.ok) {
        setMsg({ text: 'Data restored. Reloading...', ok: true })
        setTimeout(() => { onImported(); setMsg(null) }, 1500)
      } else {
        setMsg({ text: result.error ?? 'Import failed.', ok: false })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex flex-col items-start gap-0.5">
          <p className="text-sm font-semibold text-white/70">Your data</p>
          {lastBackup && !open && (
            <p className="text-[11px] text-white/25">Last backup {lastBackup}</p>
          )}
        </div>
        <span className={`text-white/30 text-sm transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4 border-t border-white/10 pt-4">
          <p className="text-xs text-white/35 leading-relaxed">
            Everything is stored only on this device. Back it up regularly so you never lose it.
          </p>

          <div className="flex gap-2">
            <button onClick={handleExport} className="flex-1 rounded-xl border border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 text-sm font-medium py-2.5 transition">
              Export backup
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex-1 rounded-xl border border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 text-sm font-medium py-2.5 transition">
              Import backup
            </button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>

          {lastBackup && (
            <p className="text-[11px] text-white/25">Last backup {lastBackup}</p>
          )}

          <div className="border-t border-white/10 pt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60 font-medium">Auto backup</p>
                <p className="text-xs text-white/30">Saves to your Documents folder automatically</p>
              </div>
              <button
                onClick={() => updateSettings({ enabled: !settings.enabled })}
                className={`w-11 h-6 rounded-full transition-colors relative ${settings.enabled ? 'bg-emerald-500' : 'bg-white/15'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${settings.enabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            {settings.enabled && (
              <div className="flex gap-2">
                {(Object.keys(INTERVAL_LABELS) as BackupInterval[]).map(interval => (
                  <button
                    key={interval}
                    onClick={() => updateSettings({ interval })}
                    className={`flex-1 rounded-xl border text-xs font-medium py-2 transition ${
                      settings.interval === interval
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/10 text-white/40 hover:text-white/70'
                    }`}
                  >
                    {INTERVAL_LABELS[interval]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {msg && (
            <p className={`text-xs ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</p>
          )}
        </div>
      )}
    </div>
  )
}
