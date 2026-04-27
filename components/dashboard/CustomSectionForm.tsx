'use client'

import { useState } from 'react'

interface CustomSectionFormProps {
  onSubmit: (name: string, notes: string) => void
  onBack: () => void
  loading: boolean
  error: string | null
}

export default function CustomSectionForm({ onSubmit, onBack, loading, error }: CustomSectionFormProps) {
  const [name, setName]   = useState('')
  const [notes, setNotes] = useState('')

  const canSubmit = name.trim().length > 0 && notes.trim().length > 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (canSubmit) onSubmit(name, notes)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-app-muted hover:text-brand-strong transition-colors self-start"
      >
        ← Back
      </button>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-app-muted">
          Section Name <span className="text-brand-strong">*</span>
        </label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. 🚀 My Goal"
          className="w-full px-3 py-2.5 text-sm text-app-text border border-border rounded-lg focus:outline-none focus:border-brand-mid"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-app-muted">
          Notes <span className="text-brand-strong">*</span>
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Track daily reading sessions"
          className="w-full px-3 py-2.5 text-sm text-app-text border border-border rounded-lg focus:outline-none focus:border-brand-mid resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="w-full py-2.5 rounded-lg bg-brand-strong text-white text-sm font-medium hover:bg-brand-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating…' : 'Create Section'}
      </button>
    </form>
  )
}
