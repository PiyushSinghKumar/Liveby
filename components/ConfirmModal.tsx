'use client'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  secondaryAction?: { label: string; onAction: () => void; className?: string }
}

export default function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, secondaryAction }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4 pb-8">
      <div className="w-full max-w-sm bg-card border border-line rounded-2xl p-6 flex flex-col gap-4 shadow-2xl">
        <div>
          <h3 className="text-base font-bold text-ink">{title}</h3>
          <p className="text-sm text-ink-2 mt-1">{message}</p>
        </div>
        <div className="flex flex-col gap-2">
          {secondaryAction && (
            <button
              onClick={secondaryAction.onAction}
              className={secondaryAction.className ?? 'w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-sm font-semibold text-white transition'}
            >
              {secondaryAction.label}
            </button>
          )}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-line text-sm text-ink-2 hover:text-ink transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-sm font-semibold text-white transition"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
