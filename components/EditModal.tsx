'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  open: boolean
  title: string
  initialValue?: string
  placeholder?: string
  onSave: (value: string) => void
  onClose: () => void
}

export default function EditModal({ open, title, initialValue = '', placeholder, onSave, onClose }: Props) {
  const [value, setValue] = useState(initialValue)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setValue(initialValue)
    if (open) setTimeout(() => ref.current?.focus(), 50)
  }, [open, initialValue])

  if (!open) return null

  function save() {
    if (!value.trim()) return
    onSave(value.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#1a1a2e] border border-white/15 rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
        <h3 className="text-base font-bold text-white/90">{title}</h3>
        <textarea
          ref={ref}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-white/30 transition"
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() } }}
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-white/50 hover:text-white/80 border border-white/10 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
