'use client'

import { useState } from 'react'
import { StandardsData } from '@/lib/types'

export interface TemplatePromise {
  text: string
  type: 'hard' | 'soft'
}

export interface Template {
  label: string
  icon: string
  color: string
  promises: TemplatePromise[]
}

export const TEMPLATES: Template[] = [
  {
    label: 'Morning Routine',
    icon: '🌅',
    color: '#f59e0b',
    promises: [
      { text: 'Wake up at a consistent time', type: 'hard' },
      { text: 'No phone for the first 30 minutes', type: 'soft' },
      { text: 'Make your bed', type: 'soft' },
      { text: 'Drink water before coffee', type: 'soft' },
    ],
  },
  {
    label: 'Health',
    icon: '💪',
    color: '#10b981',
    promises: [
      { text: 'Exercise for at least 20 minutes', type: 'hard' },
      { text: 'Eat a vegetable with every meal', type: 'soft' },
      { text: 'No junk food', type: 'soft' },
      { text: '8 glasses of water', type: 'soft' },
    ],
  },
  {
    label: 'Deep Work',
    icon: '🧠',
    color: '#6366f1',
    promises: [
      { text: '2 hours of focused work before checking messages', type: 'hard' },
      { text: 'No social media during work hours', type: 'hard' },
      { text: 'Write 3 priorities the night before', type: 'soft' },
    ],
  },
  {
    label: 'Sleep',
    icon: '🌙',
    color: '#8b5cf6',
    promises: [
      { text: 'In bed by 11pm', type: 'hard' },
      { text: 'No screens 1 hour before bed', type: 'soft' },
      { text: '7 or more hours of sleep', type: 'hard' },
    ],
  },
  {
    label: 'Relationships',
    icon: '❤️',
    color: '#f43f5e',
    promises: [
      { text: 'Call or text someone you care about', type: 'soft' },
      { text: 'Phone away during meals', type: 'hard' },
      { text: 'Do one kind thing for someone', type: 'soft' },
    ],
  },
  {
    label: 'Mindset',
    icon: '🧘',
    color: '#a855f7',
    promises: [
      { text: '10 minutes of meditation or quiet breathing', type: 'soft' },
      { text: 'Write one thing you are grateful for', type: 'soft' },
      { text: 'No complaining out loud', type: 'hard' },
    ],
  },
]

interface Props {
  standards: StandardsData
  onAdd: (template: Template) => void
  onClose: () => void
}

export default function TemplatesModal({ standards, onAdd, onClose }: Props) {
  const [selected, setSelected] = useState<Template | null>(null)

  const existingLabels = standards.categories.map(c => c.label.toLowerCase())

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl flex flex-col"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-fill-2" />
        </div>

        <div className="flex flex-col px-5 pb-2 gap-4 overflow-y-auto max-h-[85vh]">
          {selected ? (
            <>
              <div className="flex items-center gap-3 pt-2">
                <span className="text-3xl">{selected.icon}</span>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: selected.color }}>{selected.label}</h3>
                  <p className="text-xs text-ink-3">{selected.promises.length} promises</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {selected.promises.map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-fill border border-line rounded-2xl px-4 py-3">
                    <p className="text-sm text-ink flex-1">{p.text}</p>
                    <span className={`text-xs font-medium ml-3 flex-shrink-0 ${p.type === 'hard' ? 'text-rose-400' : 'text-sky-400'}`}>
                      {p.type}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-ink-4 px-1">You can edit or remove any promise after adding.</p>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 rounded-2xl border border-line text-ink-3 font-medium py-4 text-sm transition"
                >
                  Back
                </button>
                <button
                  onClick={() => { onAdd(selected); onClose() }}
                  disabled={existingLabels.includes(selected.label.toLowerCase())}
                  className="flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 text-sm transition"
                >
                  {existingLabels.includes(selected.label.toLowerCase()) ? 'Already added' : 'Add to my app'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="pt-2">
                <h2 className="text-base font-bold text-ink">Promise templates</h2>
                <p className="text-sm text-ink-3 mt-1">Ready-made categories with promises. Edit them anytime after adding.</p>
              </div>

              <div className="flex flex-col gap-2">
                {TEMPLATES.map(t => {
                  const alreadyAdded = existingLabels.includes(t.label.toLowerCase())
                  return (
                    <button
                      key={t.label}
                      onClick={() => setSelected(t)}
                      className="flex items-center gap-4 bg-fill border border-line rounded-2xl px-4 py-3 text-left transition hover:border-line-2 active:bg-fill-2"
                    >
                      <span className="text-2xl">{t.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-ink">{t.label}</p>
                        <p className="text-xs text-ink-3">{t.promises.length} promises</p>
                      </div>
                      {alreadyAdded
                        ? <span className="text-xs text-ink-4 flex-shrink-0">Added</span>
                        : <span className="text-ink-4 text-sm flex-shrink-0">›</span>
                      }
                    </button>
                  )
                })}
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-2xl border border-line text-ink-4 font-medium py-4 transition text-sm"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
