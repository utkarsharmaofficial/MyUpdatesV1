'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboardingPreferences } from '@/app/actions'
import { PROFILE_DEFINITIONS, PROFILE_ORDER } from '@/lib/profiles'
import { THEME_DEFINITIONS, THEME_ORDER, deriveCustomTheme } from '@/lib/themes'

type Step = 1 | 2

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep]                   = useState<Step>(1)
  const [selectedProfile, setSelectedProfile] = useState('HanumanJi')
  const [selectedTheme, setSelectedTheme]     = useState('orange')
  const [customColor, setCustomColor]         = useState('#FF6600')
  const [saving, setSaving]               = useState(false)

  async function handleFinish() {
    setSaving(true)
    let c1: string | undefined
    let c2: string | undefined
    let c3: string | undefined

    if (selectedTheme === 'custom') {
      const derived = deriveCustomTheme(customColor)
      c1 = derived.c1
      c2 = derived.c2
      c3 = customColor
    }

    await saveOnboardingPreferences(selectedProfile, selectedTheme, c1, c2, c3)
    router.push('/dashboard')
  }

  return (
    <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-app-text">
          Welcome to My <span style={{ color: 'var(--brand-strong)' }}>Updates</span>
        </h1>
        <p className="text-sm text-app-muted">
          {step === 1
            ? 'Step 1 of 2 — Choose your profile'
            : 'Step 2 of 2 — Choose your colour theme'}
        </p>
        {/* Progress bar */}
        <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: step === 1 ? '50%' : '100%',
              backgroundColor: 'var(--brand-strong)',
            }}
          />
        </div>
      </div>

      {/* ── Step 1: Profile Selection ─────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            {PROFILE_ORDER.map(profileId => {
              const isCustom = profileId === 'custom'
              const def = PROFILE_DEFINITIONS[profileId]
              const isSelected = selectedProfile === profileId
              return (
                <button
                  key={profileId}
                  onClick={() => setSelectedProfile(profileId)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-brand-strong bg-surface'
                      : 'border-border hover:border-brand-mid bg-white'
                  }`}
                >
                  {isCustom ? (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: 'var(--surface)', border: '2px dashed var(--border-strong)' }}
                    >
                      ✏️
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={def.logoPath}
                        alt={def.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span className="text-xs font-medium text-app-text text-center leading-tight">
                    {isCustom ? 'Custom' : def.name}
                  </span>
                  {isCustom && (
                    <span className="text-xs text-app-muted text-center leading-tight">
                      Upload your own
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setStep(2)}
            className="mt-2 py-3 rounded-xl font-medium text-sm text-white transition-colors"
            style={{ backgroundColor: 'var(--brand-strong)' }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Step 2: Theme Selection ───────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap justify-center gap-4">
            {THEME_ORDER.map(themeId => {
              const isCustomTheme = themeId === 'custom'
              const def = THEME_DEFINITIONS[themeId]
              const isSelected = selectedTheme === themeId
              const previewC1  = isCustomTheme ? deriveCustomTheme(customColor).c1 : def.c1
              const previewC2  = isCustomTheme ? deriveCustomTheme(customColor).c2 : def.c2
              const previewC3  = isCustomTheme ? customColor : def.c3

              return (
                <div key={themeId} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setSelectedTheme(themeId)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-32 ${
                      isSelected
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {/* Colour swatch showing 3 shades */}
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded-full border border-gray-200"
                           style={{ backgroundColor: previewC1 }} />
                      <div className="w-6 h-6 rounded-full border border-gray-200"
                           style={{ backgroundColor: previewC2 }} />
                      <div className="w-6 h-6 rounded-full border border-gray-200"
                           style={{ backgroundColor: previewC3 }} />
                    </div>
                    <span className="text-xs font-medium text-app-text">
                      {isCustomTheme ? '🎨 Custom' : def.name}
                    </span>
                    {isSelected && (
                      <span className="text-xs" style={{ color: 'var(--brand-strong)' }}>✓ Selected</span>
                    )}
                  </button>

                  {/* Inline color picker for custom */}
                  {isCustomTheme && isSelected && (
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="color"
                        value={customColor}
                        onChange={e => setCustomColor(e.target.value)}
                        className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"
                        title="Pick your theme colour"
                      />
                      <span className="text-xs text-app-muted">Pick colour</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Live preview bar */}
          <div className="flex items-center gap-2 p-3 rounded-lg border border-gray-100">
            <span className="text-xs text-app-muted">Preview:</span>
            {(() => {
              const t = selectedTheme === 'custom'
                ? deriveCustomTheme(customColor)
                : THEME_DEFINITIONS[selectedTheme]
              return (
                <>
                  <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: t.c1 }} />
                  <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: t.c2 }} />
                  <div className="flex-1 h-3 rounded-full" style={{ backgroundColor: t.c3 }} />
                </>
              )
            })()}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-3 rounded-xl font-medium text-sm border border-gray-200 text-app-muted hover:border-gray-400 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleFinish}
              disabled={saving}
              className="flex-1 py-3 rounded-xl font-medium text-sm text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: 'var(--brand-strong)' }}
            >
              {saving ? 'Setting up…' : 'Finish Setup'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
