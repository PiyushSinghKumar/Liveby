'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Affirmation, CheckinsData, DayCheckins, Standard, StandardsData } from '@/lib/types'
import {
  getStandards, saveStandards,
  getCheckins, saveCheckins,
  getAffirmations, saveAffirmations,
  getPenalties, savePenalties,
  hasOnboarded, setOnboarded,
  getProfile, Profile,
  todayKey,
} from '@/lib/storage'
import InstallChoice from '@/components/InstallChoice'
import WelcomeScreen from '@/components/WelcomeScreen'
import OnboardingModal from '@/components/OnboardingModal'
import ProfileSetup from '@/components/ProfileSetup'
import ProfileMenu from '@/components/ProfileMenu'
import CategoryCard from '@/components/CategoryCard'
import { SUGGESTED_CATEGORIES } from '@/components/CategoryModal'
import HeatmapCalendar from '@/components/HeatmapCalendar'
import AffirmationsPanel from '@/components/AffirmationsPanel'
import EditModal from '@/components/EditModal'
import CategoryModal from '@/components/CategoryModal'
import ScoreBanner from '@/components/ScoreBanner'
import ConfirmModal from '@/components/ConfirmModal'
import DataPortability, { useAutoBackup } from '@/components/DataPortability'

function computeStreaks(checkins: CheckinsData, standardIds: string[], today: string): Record<string, number> {
  const streaks: Record<string, number> = {}
  for (const id of standardIds) {
    let streak = 0
    const d = new Date(today)
    while (true) {
      const key = d.toISOString().split('T')[0]
      if (checkins[key]?.[id]) {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        break
      }
    }
    streaks[id] = streak
  }
  return streaks
}


type ModalState =
  | { type: 'edit'; categoryId: string; standardId: string; text: string; promiseType: 'hard' | 'soft' }
  | { type: 'add'; categoryId: string }
  | null

export default function Home() {
  const [standards, setStandards] = useState<StandardsData | null>(null)
  const [checkins, setCheckins] = useState<CheckinsData>({})
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [penalties, setPenalties] = useState<Record<string, number>>({})
  const [showInstallChoice, setShowInstallChoice] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const isInitialOnboarding = useRef(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [profile, setProfile] = useState<Profile>({ name: '' })
  useAutoBackup()
  const [modal, setModal] = useState<ModalState>(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [tab, setTab] = useState<'today' | 'calendar'>('today')
  const [confirm, setConfirm] = useState<{
    title: string; message: string; confirmLabel?: string; onConfirm: () => void
    secondaryAction?: { label: string; onAction: () => void; className?: string }
  } | null>(null)

  useEffect(() => {
    setStandards(getStandards())
    setCheckins(getCheckins())
    setAffirmations(getAffirmations())
    setPenalties(getPenalties())
    if (!hasOnboarded()) setShowWelcome(true)
    setProfile(getProfile())
    // Show install choice once to web users who haven't been prompted
    const isCapacitor = !!(window as unknown as Record<string, unknown>).Capacitor
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (!isCapacitor && !isStandalone && !localStorage.getItem('liveby_install_prompted')) {
      setShowInstallChoice(true)
    }
  }, [])

  const [today, setToday] = useState(todayKey)
  useEffect(() => {
    const interval = setInterval(() => {
      const next = todayKey()
      setToday(prev => prev !== next ? next : prev)
    }, 60_000)
    return () => clearInterval(interval)
  }, [])
  const todayCheckins: DayCheckins = checkins[today] ?? {}
  const allIds = useMemo(
    () => standards?.categories.flatMap(c => c.standards.map(s => s.id)) ?? [],
    [standards]
  )
  const streaks = useMemo(() => computeStreaks(checkins, allIds, today), [checkins, allIds, today])

  const handleToggle = useCallback((standardId: string, checked: boolean) => {
    setCheckins(prev => {
      const updated = {
        ...prev,
        [today]: { ...(prev[today] ?? {}), [standardId]: checked },
      }
      saveCheckins(updated)
      return updated
    })
  }, [today])

  const handleSaveStandards = useCallback((updated: StandardsData) => {
    setStandards(updated)
    saveStandards(updated)
  }, [])

  function handleEditStandard(categoryId: string, standardId: string, text: string) {
    const current = standards?.categories.flatMap(c => c.standards).find(s => s.id === standardId)
    setModal({ type: 'edit', categoryId, standardId, text, promiseType: current?.type ?? 'hard' })
  }

  function handleSaveEdit(newText: string, promiseType: 'hard' | 'soft') {
    if (!standards || modal?.type !== 'edit') return
    handleSaveStandards({
      categories: standards.categories.map(cat =>
        cat.id !== modal.categoryId ? cat : {
          ...cat,
          standards: cat.standards.map(s =>
            s.id !== modal.standardId ? s : { ...s, text: newText, type: promiseType }
          ),
        }
      ),
    })
  }

  function handleAddStandard(categoryId: string) {
    setModal({ type: 'add', categoryId })
  }

  function handleSaveAdd(text: string, promiseType: 'hard' | 'soft') {
    if (!standards || modal?.type !== 'add') return
    const newStandard: Standard = { id: `${modal.categoryId[0]}${Date.now()}`, text, type: promiseType, createdAt: today }
    handleSaveStandards({
      categories: standards.categories.map(cat =>
        cat.id !== modal.categoryId ? cat : {
          ...cat,
          standards: [...cat.standards, newStandard],
        }
      ),
    })
  }

  function handleDeleteStandard(categoryId: string, standardId: string) {
    if (!standards) return
    const standard = standards.categories.find(c => c.id === categoryId)?.standards.find(s => s.id === standardId)
    const isHard = !standard?.type || standard.type === 'hard'

    function doDelete() {
      handleSaveStandards({
        categories: standards!.categories.map(cat =>
          cat.id !== categoryId ? cat : {
            ...cat,
            standards: cat.standards.filter(s => s.id !== standardId),
          }
        ),
      })
      setConfirm(null)
    }

    if (isHard) {
      setConfirm({
        title: 'Remove hard promise?',
        message: `"${standard?.text ?? 'This promise'}" is a hard commitment. How are you removing it?`,
        secondaryAction: {
          label: '✅ Promise fulfilled - remove it',
          onAction: () => { doDelete() },
        },
        confirmLabel: '❌ Giving up - remove with -1 penalty',
        onConfirm: () => {
          const updated = { ...penalties, [today]: (penalties[today] ?? 0) + 1 }
          setPenalties(updated)
          savePenalties(updated)
          doDelete()
        },
      })
    } else {
      setConfirm({
        title: 'Delete promise?',
        message: `"${standard?.text ?? 'This promise'}" will be permanently removed.`,
        onConfirm: () => { doDelete() },
      })
    }
  }

  function handleAddCategory(label: string, icon: string, color: string) {
    if (!standards) return
    const id = label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    handleSaveStandards({
      categories: [...standards.categories, { id, label, icon, color, standards: [] }],
    })
  }

  function handleEditCategory(categoryId: string) {
    setEditingCategoryId(categoryId)
  }

  function handleSaveEditCategory(label: string, icon: string, color: string) {
    if (!standards || !editingCategoryId) return
    handleSaveStandards({
      categories: standards.categories.map(c =>
        c.id !== editingCategoryId ? c : { ...c, label, icon, color }
      ),
    })
    setEditingCategoryId(null)
  }

  function handleDeleteCategory(categoryId: string) {
    if (!standards) return
    const cat = standards.categories.find(c => c.id === categoryId)
    if (cat && cat.standards.length > 0) {
      setConfirm({
        title: `Can't delete "${cat.label}"`,
        message: `Remove all ${cat.standards.length} promise(s) inside it first, then delete the category.`,
        confirmLabel: 'Got it',
        onConfirm: () => setConfirm(null),
      })
      return
    }
    setConfirm({
      title: `Delete "${cat?.label ?? 'category'}"?`,
      message: 'This category is empty and will be permanently removed.',
      onConfirm: () => {
        handleSaveStandards({
          categories: standards.categories.filter(c => c.id !== categoryId),
        })
        setConfirm(null)
      },
    })
  }

  function handleAddAffirmation(text: string, category: string) {
    const newItem: Affirmation = {
      id: Date.now().toString(),
      text,
      category,
      createdAt: new Date().toISOString(),
    }
    const updated = [...affirmations, newItem]
    setAffirmations(updated)
    saveAffirmations(updated)
  }

  function handleDeleteAffirmation(id: string) {
    const affirmation = affirmations.find(a => a.id === id)
    setConfirm({
      title: 'Delete affirmation?',
      message: `"${affirmation?.text ?? 'This affirmation'}" will be permanently removed.`,
      onConfirm: () => {
        const updated = affirmations.filter(a => a.id !== id)
        setAffirmations(updated)
        saveAffirmations(updated)
        setConfirm(null)
      },
    })
  }

  if (!standards) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
      </div>
    )
  }

  const categoryLabels = standards.categories.map(c => c.label)

  return (
    <>
    {showInstallChoice && (
      <InstallChoice onDone={() => {
        localStorage.setItem('liveby_install_prompted', 'true')
        setShowInstallChoice(false)
      }} />
    )}
    {showWelcome && (
      <WelcomeScreen onStart={() => {
        setShowWelcome(false)
        isInitialOnboarding.current = true
        setShowOnboarding(true)
      }} />
    )}
    {showOnboarding && (
      <OnboardingModal onDone={() => {
        setOnboarded()
        setShowOnboarding(false)
        if (isInitialOnboarding.current && !getProfile().name) setShowProfileSetup(true)
        isInitialOnboarding.current = false
      }} />
    )}
    {showProfileSetup && (
      <ProfileSetup onDone={name => {
        if (name) setProfile(p => ({ ...p, name }))
        setShowProfileSetup(false)
      }} />
    )}
    {showProfileMenu && (
      <ProfileMenu
        profile={profile}
        onClose={() => setShowProfileMenu(false)}
        onEditName={() => setShowProfileSetup(true)}
        onProfileChange={setProfile}
      />
    )}
    <div className="min-h-screen max-w-5xl mx-auto flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[#0d0d1a] px-4 pt-8 pb-4 flex flex-col gap-4">
        <ScoreBanner checkins={checkins} standards={standards} todayKey={today} todayCheckins={todayCheckins} penalties={penalties} profileName={profile.name} profilePhoto={profile.photo} onEditProfile={() => setShowProfileMenu(true)} />

        <div className="flex items-center gap-2 justify-center">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit">
          {(['today', 'calendar'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {t === 'today' ? 'Today' : 'Calendar'}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowOnboarding(true)}
          className="w-7 h-7 rounded-full border border-white/15 text-white/30 hover:text-white/70 hover:border-white/30 text-sm font-semibold transition flex items-center justify-center"
          title="Show tutorial"
        >
          ?
        </button>
        </div>
      </div>

      {/* Scrollable content */}
      <main className="flex-1 px-4 pb-8 pt-4">

      {tab === 'today' && (
        <div className="flex flex-col gap-4">
          {standards.categories.length === 0 && (
            <div className="text-center py-6">
              <p className="text-white/60 font-semibold text-base">Choose your focus area</p>
              <p className="text-white/30 text-sm mt-1">Pick from suggestions below or create your own</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standards.categories.map(cat => (
              <CategoryCard
                key={cat.id}
                category={cat}
                todayCheckins={todayCheckins}
                streaks={streaks}
                onToggle={handleToggle}
                onEditStandard={handleEditStandard}
                onAddStandard={handleAddStandard}
                onDeleteStandard={handleDeleteStandard}
                onDeleteCategory={handleDeleteCategory}
                onEditCategory={handleEditCategory}
              />
            ))}
          </div>

          {/* Suggestions - always visible, includes Custom chip */}
          {(() => {
            const existing = standards.categories.map(c => c.label.toLowerCase())
            const remaining = SUGGESTED_CATEGORIES.filter(s => !existing.includes(s.label.toLowerCase()))
            return (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
                <p className="text-xs text-white/35 font-medium uppercase tracking-wide">Add a focus area</p>
                <div className="flex flex-wrap gap-2">
                  {remaining.map(s => (
                    <button
                      key={s.label}
                      onClick={() => handleAddCategory(s.label, s.icon, s.color)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 active:bg-white/15 transition text-sm text-white/50 hover:text-white/90"
                    >
                      <span>{s.icon}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setCategoryModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 active:bg-white/15 transition text-sm text-white/50 hover:text-white/90"
                  >
                    <span>✏️</span>
                    <span>Custom</span>
                  </button>
                </div>
              </div>
            )
          })()}

          {/* Affirmations - inline */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <AffirmationsPanel
              affirmations={affirmations}
              categoryLabels={categoryLabels}
              onAdd={handleAddAffirmation}
              onDelete={handleDeleteAffirmation}
            />
          </div>

<DataPortability onImported={() => {
            setStandards(getStandards())
            setCheckins(getCheckins())
            setAffirmations(getAffirmations())
            setPenalties(getPenalties())
          }} />
        </div>
      )}

      {tab === 'calendar' && (
        <HeatmapCalendar checkins={checkins} standards={standards} penalties={penalties} />
      )}

      <EditModal
        open={!!modal}
        title={modal?.type === 'add' ? 'Add Promise' : 'Edit Promise'}
        initialValue={modal?.type === 'edit' ? modal.text : ''}
        initialType={modal?.type === 'edit' ? modal.promiseType : 'hard'}
        placeholder="Write your promise..."
        onSave={modal?.type === 'add' ? handleSaveAdd : handleSaveEdit}
        onClose={() => setModal(null)}
      />

      <CategoryModal
        open={categoryModalOpen}
        existingLabels={standards.categories.map(c => c.label)}
        onSave={handleAddCategory}
        onClose={() => setCategoryModalOpen(false)}
      />

      <CategoryModal
        open={!!editingCategoryId}
        initialValues={editingCategoryId ? (() => { const c = standards.categories.find(x => x.id === editingCategoryId); return c ? { label: c.label, icon: c.icon, color: c.color } : undefined })() : undefined}
        onSave={handleSaveEditCategory}
        onClose={() => setEditingCategoryId(null)}
      />

      <ConfirmModal
        open={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.confirmLabel}
        secondaryAction={confirm?.secondaryAction}
        onConfirm={confirm?.onConfirm ?? (() => {})}
        onCancel={() => setConfirm(null)}
      />
</main>
    </div>
    </>
  )
}
