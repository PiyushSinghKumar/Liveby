'use client'

import { useRef } from 'react'
import { saveProfile, getProfile, Profile } from '@/lib/storage'

interface Props {
  profile: Profile
  onClose: () => void
  onEditName: () => void
  onProfileChange: (p: Profile) => void
}

function resizeImage(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!
      const min = Math.min(img.width, img.height)
      const sx = (img.width - min) / 2
      const sy = (img.height - min) / 2
      ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = reject
    img.src = url
  })
}

export default function ProfileMenu({ profile, onClose, onEditName, onProfileChange }: Props) {
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const photo = await resizeImage(file)
      const updated = { ...getProfile(), photo }
      saveProfile(updated)
      onProfileChange(updated)
    } catch { /* ignore */ }
    e.target.value = ''
    onClose()
  }

  function removePhoto() {
    const updated = { ...getProfile(), photo: undefined }
    saveProfile(updated)
    onProfileChange(updated)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* Bottom sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl flex flex-col"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-fill-2" />
        </div>

        {/* Avatar preview */}
        <div className="flex flex-col items-center gap-2 py-5">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-line bg-fill-2 flex items-center justify-center">
            {profile.photo
              ? <img src={profile.photo} alt="profile" className="w-full h-full object-cover" />
              : <span className="text-3xl font-bold text-ink-2">
                  {profile.name ? profile.name[0].toUpperCase() : '?'}
                </span>
            }
          </div>
          <p className="text-ink-2 text-sm font-medium">{profile.name || 'No name set'}</p>
        </div>

        {/* Options */}
        <div className="flex flex-col px-4 gap-2">
          <button
            onClick={() => cameraRef.current?.click()}
            className="w-full rounded-2xl bg-fill-2 hover:bg-fill-2 border border-line text-ink-2 font-medium py-4 transition text-sm"
          >
            Take a photo
          </button>
          <button
            onClick={() => galleryRef.current?.click()}
            className="w-full rounded-2xl bg-fill-2 hover:bg-fill-2 border border-line text-ink-2 font-medium py-4 transition text-sm"
          >
            Choose from gallery
          </button>
          <button
            onClick={() => { onClose(); onEditName() }}
            className="w-full rounded-2xl bg-fill-2 hover:bg-fill-2 border border-line text-ink-2 font-medium py-4 transition text-sm"
          >
            Edit name
          </button>
          {profile.photo && (
            <button
              onClick={removePhoto}
              className="w-full rounded-2xl bg-fill-2 hover:bg-fill-2 border border-line text-red-400 font-medium py-4 transition text-sm"
            >
              Remove photo
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-line text-ink-4 font-medium py-4 transition text-sm"
          >
            Cancel
          </button>
        </div>

        <input ref={cameraRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handlePhoto} />
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>
    </>
  )
}
