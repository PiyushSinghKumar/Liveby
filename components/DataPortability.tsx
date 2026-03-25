'use client'

import { useRef, useState } from 'react'
import { exportData, importData } from '@/lib/storage'

interface Props {
  onImported: () => void
}

export default function DataPortability({ onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)

  async function handleExport() {
    const filename = `liveby-backup-${new Date().toISOString().split('T')[0]}.json`
    const blob = new Blob([exportData()], { type: 'application/json' })
    const file = new File([blob], filename, { type: 'application/json' })

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Liveby Backup' })
        return
      } catch {
        // user cancelled or share failed, fall through to download
      }
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

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const result = importData(ev.target?.result as string)
      if (result.ok) {
        setMsg({ text: 'Data restored successfully. Reloading...', ok: true })
        setTimeout(() => { onImported(); setMsg(null) }, 1500)
      } else {
        setMsg({ text: result.error ?? 'Import failed.', ok: false })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-white/70">Your data</p>
        <p className="text-xs text-white/35 leading-relaxed">
          Everything is stored only on this device. If you switch devices or clear your browser, your data will be lost.
          Back it up by exporting and saving the file somewhere safe.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 rounded-xl border border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 text-sm font-medium py-2.5 transition"
        >
          Export backup
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 rounded-xl border border-white/15 text-white/60 hover:text-white/90 hover:border-white/30 text-sm font-medium py-2.5 transition"
        >
          Import backup
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      </div>

      {msg && (
        <p className={`text-xs ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>{msg.text}</p>
      )}
    </div>
  )
}
