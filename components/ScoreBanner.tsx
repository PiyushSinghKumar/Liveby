'use client'

import { useMemo, useEffect, useState } from 'react'
import { CheckinsData, StandardsData } from '@/lib/types'
import { updateAppIcon } from '@/lib/appIcon'
import { buildContext, getMotivation } from '@/lib/motivation'
import { scoreTodayLive, scoreDay, rollingAvg, sparklineScores, lifetimeScore } from '@/lib/score'

interface Props {
  checkins: CheckinsData
  standards: StandardsData
  todayKey: string
  todayCheckins: Record<string, boolean>
  penalties?: Record<string, number>
  profileName?: string
  profilePhoto?: string
  onEditProfile?: () => void
}

type Level = { label: string; color: string; ring: string; bg: string; text: string }

const LEVELS: { min: number; max: number; level: Level }[] = [
  {
    min: 0, max: 2.4,
    level: { label: 'Come back to me', color: 'text-red-400', ring: 'ring-red-500/50', bg: 'bg-red-500/15', text: 'text-red-300' },
  },
  {
    min: 2.5, max: 4.9,
    level: { label: "I know you can do more", color: 'text-orange-400', ring: 'ring-orange-500/50', bg: 'bg-orange-500/15', text: 'text-orange-300' },
  },
  {
    min: 5, max: 7.4,
    level: { label: "We're getting there", color: 'text-yellow-400', ring: 'ring-yellow-500/50', bg: 'bg-yellow-500/15', text: 'text-yellow-300' },
  },
  {
    min: 7.5, max: 10,
    level: { label: 'This is who we are', color: 'text-emerald-400', ring: 'ring-emerald-500/50', bg: 'bg-emerald-500/15', text: 'text-emerald-300' },
  },
]

function getLevel(score: number): Level {
  return LEVELS.find(l => score >= l.min && score <= l.max)!.level
}

export default function ScoreBanner({ checkins, standards, todayKey, todayCheckins, penalties, profileName, profilePhoto, onEditProfile }: Props) {
  const [quote, setQuote] = useState(() => getMotivation(buildContext(checkins, standards)))
  const [fading, setFading] = useState(false)

  const todayScore = scoreTodayLive(todayCheckins, standards, todayKey, penalties)
  const yesterdayScore = useMemo(() => {
    const d = new Date(todayKey)
    d.setDate(d.getDate() - 1)
    return scoreDay(d.toISOString().split('T')[0], checkins, standards, penalties)
  }, [checkins, standards, todayKey, penalties])

  const rolling = useMemo(() => rollingAvg(checkins, standards, 7, penalties), [checkins, standards, penalties])
  const sparks = useMemo(() => sparklineScores(checkins, standards, 7, penalties), [checkins, standards, penalties])
  const lifetime = useMemo(() => lifetimeScore(checkins, standards, penalties), [checkins, standards, penalties])

  const level = getLevel(lifetime ?? todayScore)

  useEffect(() => { updateAppIcon(todayScore) }, [todayScore])

  useEffect(() => {
    setQuote(getMotivation(buildContext(checkins, standards)))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Trend: compare 7-day rolling avg against lifetime score
  const trend =
    lifetime === null || rolling === null ? null :
    rolling > lifetime + 0.3 ? 'up' :
    rolling < lifetime - 0.3 ? 'down' : 'flat'

  const hasCheckedInToday = Object.keys(todayCheckins).some(k => todayCheckins[k])
  const prevLevel = yesterdayScore !== null ? getLevel(yesterdayScore) : null
  const levelDropped = hasCheckedInToday && lifetime !== null && prevLevel &&
    prevLevel.label !== level.label &&
    LEVELS.findIndex(l => l.level.label === level.label) <
    LEVELS.findIndex(l => l.level.label === prevLevel!.label)

  function refreshQuote() {
    setFading(true)
    setTimeout(() => {
      setQuote(getMotivation(buildContext(checkins, standards)))
      setFading(false)
    }, 200)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className={`rounded-2xl border ring-1 ${level.ring} ${level.bg} border-line p-5`}>
        <div className="flex items-start gap-4">
          {/* Score */}
          <div className="flex-shrink-0">
            {/* Lifetime score - primary */}
            <div className="flex items-end gap-1.5">
              <span className={`text-5xl font-black tabular-nums ${level.color}`}>
                {(lifetime ?? todayScore).toFixed(1)}
              </span>
              <span className="text-lg text-ink-4 mb-1">/10</span>
              {trend === 'up' && <span className="text-emerald-400 text-lg mb-1">↑</span>}
              {trend === 'down' && <span className="text-red-400 text-lg mb-1">↓</span>}
              {trend === 'flat' && <span className="text-ink-4 text-lg mb-1">→</span>}
            </div>
            <p className={`text-sm font-semibold mt-0.5 ${level.color}`}>{level.label}</p>

            {/* Today score - secondary */}
            <p className="text-[11px] text-ink-3 mt-1.5">
              today{' '}
              <span className={`font-semibold ${getLevel(todayScore).color}`}>
                {todayScore.toFixed(1)}
              </span>
            </p>

            {/* Sparkline */}
            <div className="flex items-end gap-0.5 h-6 mt-2">
              {sparks.map((s, i) => {
                const h = s !== null ? Math.max(3, (s / 10) * 24) : 3
                const lv = s !== null ? getLevel(s) : null
                return (
                  <div
                    key={i}
                    style={{ height: `${h}px` }}
                    className={`w-2 rounded-sm transition-all ${
                      s === null ? 'bg-fill-2' :
                      lv?.label === 'This is who we are' ? 'bg-emerald-400' :
                      lv?.label === "We're getting there" ? 'bg-yellow-400' :
                      lv?.label === 'I know you can do more' ? 'bg-orange-400' : 'bg-red-400'
                    }`}
                  />
                )
              })}
            </div>
            {rolling !== null && (
              <p className="text-[11px] text-ink-3 mt-1">
                last 7 days <span className="text-ink-2 font-semibold">{rolling.toFixed(1)}</span>
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-fill-2 flex-shrink-0" />

          {/* Quote */}
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <div className="flex items-start gap-2">
              <div className={`flex-1 flex flex-col gap-1 transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-xs leading-relaxed text-ink-2 italic">{quote}</p>
              </div>
              <button
                onClick={refreshQuote}
                className="flex-shrink-0 text-ink-4 hover:text-ink-2 active:text-ink transition text-sm"
                title="New message"
              >
                ↻
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onEditProfile}
                className="w-6 h-6 rounded-full overflow-hidden bg-fill-2 hover:bg-fill-3 border border-line flex items-center justify-center transition flex-shrink-0"
                title={profileName || 'Set your name'}
              >
                {profilePhoto
                  ? <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
                  : <span className={`text-[10px] font-bold ${level.color}`}>
                      {profileName ? profileName[0].toUpperCase() : '?'}
                    </span>
                }
              </button>
              <p className="text-[10px] text-ink-4">future {profileName || 'you'}</p>
              <button
                onClick={() => {
                  const score = (lifetime ?? todayScore).toFixed(1)
                  const text = `My Liveby score is ${score}/10 — "${level.label}". Keeping my promises one day at a time.`
                  if (navigator.share) navigator.share({ title: 'Liveby', text })
                  else navigator.clipboard?.writeText(text)
                }}
                className="ml-auto text-ink-4 hover:text-ink-2 transition text-xs"
                title="Share your score"
              >
                ↗
              </button>
            </div>
          </div>
        </div>
      </div>

      {levelDropped && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-center gap-2">
          <span className="text-red-400 text-base">⚠</span>
          <p className="text-sm text-red-300">
            You slipped a level. Your future self knows you can turn this around today.
          </p>
        </div>
      )}
    </div>
  )
}
