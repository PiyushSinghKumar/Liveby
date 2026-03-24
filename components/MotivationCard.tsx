'use client'

import { useState, useEffect } from 'react'
import { CheckinsData, StandardsData } from '@/lib/types'
import { buildContext, getMotivation } from '@/lib/motivation'

interface Props {
  checkins: CheckinsData
  standards: StandardsData
}

export default function MotivationCard({ checkins, standards }: Props) {
  const [message, setMessage] = useState('')
  const [fading, setFading] = useState(false)

  function refresh() {
    setFading(true)
    setTimeout(() => {
      setMessage(getMotivation(buildContext(checkins, standards)))
      setFading(false)
    }, 200)
  }

  useEffect(() => {
    setMessage(getMotivation(buildContext(checkins, standards)))
  }, [checkins, standards])

  if (!message) return null

  return (
    <div className="flex items-start gap-2 mt-2">
      <p
        className={`flex-1 text-xs leading-relaxed text-white/45 italic transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}
      >
        {message}
      </p>
      <button
        onClick={refresh}
        className="flex-shrink-0 text-white/20 hover:text-white/60 active:text-white/80 transition text-sm mt-0.5"
        title="New message"
      >
        ↻
      </button>
    </div>
  )
}
