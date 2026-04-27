'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CustomSectionForm from './CustomSectionForm'

interface Section {
  id: string
  type: 'workout' | 'expenses' | 'custom'
  name: string
  notes: string | null
  position: number
}

interface AddSectionModalProps {
  onClose: () => void
  onSectionAdded: (section: Section) => void
  sectionsCount: number
}

const OPTIONS = [
  { type: 'workout'  as const, icon: '🏋️', label: 'Workout',  sub: 'Track gym sessions'    },
  { type: 'expenses' as const, icon: '💰', label: 'Expenses', sub: 'Track daily spending'   },
  { type: 'custom'   as const, icon: '✏️', label: 'Custom',   sub: 'Define your own'        },
]

export default function AddSectionModal({ onClose, onSectionAdded, sectionsCount }: AddSectionModalProps) {
  const [view, setView]     = useState<'options' | 'custom-form'>('options')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function handleQuickCreate(type: 'workout' | 'expenses') {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const name = type === 'workout' ? '🏋️ Workout' : '💰 Expenses'
    const { data, error } = await supabase
      .from('sections')
      .insert({ type, name, position: sectionsCount + 1, user_id: user.id })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    onSectionAdded(data as Section)
  }

  async function handleCustomSubmit(name: string, notes: string) {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error } = await supabase
      .from('sections')
      .insert({
        type: 'custom',
        name: name.trim(),
        notes: notes.trim(),
        position: sectionsCount + 1,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    onSectionAdded(data as Section)
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full max-w-sm mx-4 p-8 border border-border relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-app-muted hover:text-app-text text-lg leading-none"
          title="Close"
        >
          ×
        </button>

        {view === 'options' ? (
          <>
            <h2 className="text-base font-semibold text-app-text mb-6">Add Section</h2>

            <div className="flex flex-col gap-3">
              {OPTIONS.map(opt => (
                <button
                  key={opt.type}
                  disabled={loading}
                  onClick={() => {
                    if (opt.type === 'custom') {
                      setView('custom-form')
                      setError(null)
                    } else {
                      handleQuickCreate(opt.type)
                    }
                  }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-brand-strong transition-colors text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-app-text">{opt.label}</span>
                    <span className="text-xs text-app-muted">{opt.sub}</span>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 mt-4">{error}</p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-base font-semibold text-app-text mb-6">Custom Section</h2>
            <CustomSectionForm
              onSubmit={handleCustomSubmit}
              onBack={() => { setView('options'); setError(null) }}
              loading={loading}
              error={error}
            />
          </>
        )}
      </div>
    </div>
  )
}
