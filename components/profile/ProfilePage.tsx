'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type UserMediaItem, type UserProfile } from '@/lib/utils'
import { PROFILE_DEFINITIONS, PROFILE_ORDER } from '@/lib/profiles'
import { THEME_DEFINITIONS, THEME_ORDER, deriveCustomTheme } from '@/lib/themes'
import { saveOnboardingPreferences } from '@/app/actions'

interface ProfilePageProps {
  initialMedia: UserMediaItem[]
  userId:       string
  userProfile:  UserProfile
}

const IMAGE_LIMIT       = 10
const SONG_LIMIT        = 5
const IMAGE_MAX_BYTES   = 5  * 1024 * 1024   // 5 MB
const SONG_MAX_BYTES    = 20 * 1024 * 1024   // 20 MB
const LOGO_MAX_BYTES    = 2  * 1024 * 1024   // 2 MB

export default function ProfilePage({ initialMedia, userId, userProfile }: ProfilePageProps) {
  const [media, setMedia]         = useState<UserMediaItem[]>(initialMedia)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [error, setError]         = useState<string | null>(null)

  // ── Profile & theme selection state ──────────────────────────
  const [selectedProfile, setSelectedProfile] = useState(userProfile.selected_profile)
  const [selectedTheme, setSelectedTheme]     = useState(userProfile.theme_color)
  const [customColor, setCustomColor]         = useState(userProfile.custom_theme_c3 ?? '#FF6600')
  const [savingPrefs, setSavingPrefs]         = useState(false)
  const [prefsSaved, setPrefsSaved]           = useState(false)

  // ── Audio preview ─────────────────────────────────────────────
  const imageInputRef = useRef<HTMLInputElement>(null)
  const songInputRef  = useRef<HTMLInputElement>(null)
  const logoInputRef  = useRef<HTMLInputElement>(null)
  const previewAudio  = useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const router = useRouter()

  const images = media.filter(m => m.type === 'image')
  const songs  = media.filter(m => m.type === 'song')
  const logo   = media.find(m => m.type === 'logo') ?? null

  const supabase = createClient()

  useEffect(() => {
    return () => {
      previewAudio.current?.pause()
      previewAudio.current = null
    }
  }, [])

  // ── Preferences save ─────────────────────────────────────────

  async function handleSavePreferences() {
    setSavingPrefs(true)
    setError(null)

    let c1: string | undefined
    let c2: string | undefined
    let c3: string | undefined

    if (selectedTheme === 'custom') {
      const derived = deriveCustomTheme(customColor)
      c1 = derived.c1
      c2 = derived.c2
      c3 = customColor
    }

    const result = await saveOnboardingPreferences(selectedProfile, selectedTheme, c1, c2, c3)
    if (result && 'error' in result) {
      setError(String(result.error))
    } else {
      setPrefsSaved(true)
      setTimeout(() => setPrefsSaved(false), 3000)
    }
    setSavingPrefs(false)
  }

  // ── Media upload / delete ─────────────────────────────────────

  async function handleUpload(file: File, type: 'image' | 'song' | 'logo') {
    setError(null)
    const maxBytes = type === 'image' ? IMAGE_MAX_BYTES : type === 'song' ? SONG_MAX_BYTES : LOGO_MAX_BYTES
    const limitLabel = type === 'image' ? '5' : type === 'song' ? '20' : '2'

    if (file.size > maxBytes) {
      setError(`${type === 'song' ? 'Song' : type === 'logo' ? 'Logo' : 'Image'} must be under ${limitLabel} MB.`)
      return
    }

    if (type === 'image' && images.length >= IMAGE_LIMIT) return
    if (type === 'song'  && songs.length  >= SONG_LIMIT)  return

    setUploading(true)
    const ext    = file.name.split('.').pop()
    const folder = type === 'image' ? 'images' : type === 'song' ? 'songs' : 'logo'
    const path   = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`

    const { error: storageError } = await supabase.storage.from('user-media').upload(path, file)
    if (storageError) { setError(storageError.message); setUploading(false); return }

    const { data: urlData } = supabase.storage.from('user-media').getPublicUrl(path)

    const { data: row, error: dbError } = await supabase
      .from('user_media')
      .insert({ user_id: userId, type, storage_path: path, public_url: urlData.publicUrl, display_name: file.name })
      .select()
      .single()

    if (dbError) { setError(dbError.message); setUploading(false); return }

    const { data: signedData } = await supabase.storage
      .from('user-media')
      .createSignedUrl(path, 60 * 60)

    const newItem: UserMediaItem = {
      ...(row as UserMediaItem),
      display_url: signedData?.signedUrl ?? (row as UserMediaItem).public_url,
    }
    setMedia(prev => [...prev, newItem])
    setUploading(false)
  }

  async function handleDelete(item: UserMediaItem) {
    setError(null)
    setDeleting(item.id)

    const { error: storageError } = await supabase.storage.from('user-media').remove([item.storage_path])
    if (storageError) { setError(storageError.message); setDeleting(null); return }

    await supabase.from('user_media').delete().eq('id', item.id)
    setMedia(prev => prev.filter(m => m.id !== item.id))
    setDeleting(null)
  }

  async function handleLogoUpload(file: File) {
    // Replace existing logo: delete old first
    if (logo) await handleDelete(logo)
    await handleUpload(file, 'logo')
  }

  function playPreview(item: UserMediaItem) {
    if (playingId === item.id) {
      previewAudio.current?.pause()
      setPlayingId(null)
      return
    }
    previewAudio.current?.pause()
    const url = item.display_url ?? item.public_url
    const audio = new Audio(url)
    audio.play().catch(() => {})
    audio.addEventListener('ended', () => setPlayingId(null))
    previewAudio.current = audio
    setPlayingId(item.id)
  }

  function handleBackToDashboard() {
    previewAudio.current?.pause()
    previewAudio.current = null
    setPlayingId(null)
    router.push('/dashboard')
  }

  // ── Derived theme preview ─────────────────────────────────────

  function getPreviewColors(themeId: string) {
    if (themeId === 'custom') {
      const d = deriveCustomTheme(customColor)
      return { c1: d.c1, c2: d.c2, c3: customColor }
    }
    const d = THEME_DEFINITIONS[themeId]
    return { c1: d.c1, c2: d.c2, c3: d.c3 }
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl pb-8">
      {/* Back link */}
      <button
        onClick={handleBackToDashboard}
        className="text-sm text-app-muted hover:text-brand-strong transition-colors self-start"
      >
        ← Back to Dashboard
      </button>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* ── Section A: Profile & Theme Settings ──────────────── */}
      <section className="flex flex-col gap-6 p-5 bg-surface border border-border rounded-xl">
        <h2 className="text-base font-semibold text-app-text">Profile Settings</h2>

        {/* Profile selector */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-app-text">Choose Profile</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {PROFILE_ORDER.map(profileId => {
              const isCustom   = profileId === 'custom'
              const def        = PROFILE_DEFINITIONS[profileId]
              const isSelected = selectedProfile === profileId
              return (
                <button
                  key={profileId}
                  onClick={() => setSelectedProfile(profileId)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-brand-strong bg-surface'
                      : 'border-border hover:border-brand-mid bg-white'
                  }`}
                >
                  {isCustom ? (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 border-dashed border-border-strong bg-white">
                      ✏️
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={def.logoPath} alt={def.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-app-text text-center leading-tight">
                    {isCustom ? 'Custom' : def.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Theme selector */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-app-text">Choose Theme Colour</h3>
          <div className="flex flex-wrap gap-3">
            {THEME_ORDER.map(themeId => {
              const isCustomTheme = themeId === 'custom'
              const isSelected    = selectedTheme === themeId
              const { c1, c2, c3 } = getPreviewColors(themeId)
              return (
                <div key={themeId} className="flex flex-col items-center gap-1.5">
                  <button
                    onClick={() => setSelectedTheme(themeId)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all w-24 ${
                      isSelected
                        ? 'border-gray-800 bg-gray-50'
                        : 'border-border hover:border-app-muted bg-white'
                    }`}
                  >
                    <div className="flex gap-1">
                      <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: c1 }} />
                      <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: c2 }} />
                      <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: c3 }} />
                    </div>
                    <span className="text-xs font-medium text-app-text">
                      {isCustomTheme ? '🎨 Custom' : THEME_DEFINITIONS[themeId].name}
                    </span>
                  </button>
                  {isCustomTheme && isSelected && (
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="color"
                        value={customColor}
                        onChange={e => setCustomColor(e.target.value)}
                        className="w-9 h-9 rounded-lg cursor-pointer border border-border"
                      />
                      <span className="text-xs text-app-muted">Pick colour</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSavePreferences}
          disabled={savingPrefs}
          className="self-start px-6 py-2.5 rounded-lg bg-brand-strong text-white text-sm font-medium hover:bg-brand-mid transition-colors disabled:opacity-60"
        >
          {savingPrefs ? 'Saving…' : 'Save Changes'}
        </button>

        {prefsSaved && (
          <p className="text-sm text-green-600 -mt-2">
            Preferences saved! Reload the page to see the new logo and colours.
          </p>
        )}
      </section>

      {/* ── Section B: Custom Media (only for Custom profile) ─── */}
      {selectedProfile === 'custom' && (
        <section className="flex flex-col gap-6">
          <h2 className="text-base font-semibold text-app-text">Your Media</h2>

          <div className="flex flex-col md:flex-row gap-4">

            {/* Logo Panel */}
            <div className="flex flex-col gap-4 p-5 bg-surface border border-border rounded-xl" style={{ minWidth: 180 }}>
              <h3 className="text-sm font-semibold text-app-text">🪪 Logo (1 max)</h3>

              {logo ? (
                <div className="flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo.display_url ?? logo.public_url}
                    alt="Custom Logo"
                    className="w-20 h-20 rounded-full object-cover border border-border"
                  />
                  <span className="text-xs text-app-muted text-center truncate max-w-full">{logo.display_name}</span>
                  <button
                    onClick={() => handleDelete(logo)}
                    disabled={deleting === logo.id}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors"
                  >
                    {deleting === logo.id ? 'Removing…' : 'Remove Logo'}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-app-muted">No logo uploaded yet.</p>
              )}

              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploading}
                className="self-start text-sm px-4 py-2 rounded-lg border border-brand-strong text-brand-strong hover:bg-brand-strong hover:text-white transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : logo ? 'Replace Logo' : 'Upload Logo'}
              </button>
              <input
                ref={logoInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleLogoUpload(file)
                  e.target.value = ''
                }}
              />
            </div>

            {/* Images Panel */}
            <div className="flex-1 flex flex-col gap-4 p-5 bg-surface border border-border rounded-xl">
              <h3 className="text-sm font-semibold text-app-text">
                🖼️ Images ({images.length} / {IMAGE_LIMIT})
              </h3>

              <div className="flex flex-wrap gap-3">
                {images.map(img => (
                  <div key={img.id} className="relative w-24 h-24 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.display_url ?? img.public_url}
                      alt={img.display_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDelete(img)}
                      disabled={deleting === img.id}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-brand-strong text-white flex items-center justify-center text-xs hover:bg-brand-mid transition-colors disabled:opacity-50"
                    >
                      {deleting === img.id ? '…' : '🗑'}
                    </button>
                  </div>
                ))}
              </div>

              {images.length >= IMAGE_LIMIT ? (
                <p className="text-xs text-app-muted">
                  Maximum {IMAGE_LIMIT} images reached. Delete one to add more.
                </p>
              ) : (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading}
                  className="self-start text-sm px-4 py-2 rounded-lg border border-brand-strong text-brand-strong hover:bg-brand-strong hover:text-white transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : 'Upload Image'}
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(file, 'image')
                  e.target.value = ''
                }}
              />
            </div>
          </div>

          {/* Songs Panel */}
          <div className="flex flex-col gap-4 p-5 bg-surface border border-border rounded-xl">
            <h3 className="text-sm font-semibold text-app-text">
              🎵 Songs ({songs.length} / {SONG_LIMIT})
            </h3>

            <div className="flex flex-col gap-2">
              {songs.map(song => (
                <div
                  key={song.id}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg"
                >
                  <button
                    onClick={() => playPreview(song)}
                    className="text-brand-mid hover:text-brand-strong transition-colors text-sm flex-shrink-0 w-5 text-center"
                  >
                    {playingId === song.id ? '⏸' : '▶'}
                  </button>
                  <span className="flex-1 text-sm text-app-text truncate">{song.display_name}</span>
                  <button
                    onClick={() => handleDelete(song)}
                    disabled={deleting === song.id}
                    className="w-6 h-6 rounded-full bg-brand-strong text-white flex items-center justify-center text-xs hover:bg-brand-mid transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {deleting === song.id ? '…' : '🗑'}
                  </button>
                </div>
              ))}
            </div>

            {songs.length >= SONG_LIMIT ? (
              <p className="text-xs text-app-muted">
                Maximum {SONG_LIMIT} songs reached. Delete one to add more.
              </p>
            ) : (
              <button
                onClick={() => songInputRef.current?.click()}
                disabled={uploading}
                className="self-start text-sm px-4 py-2 rounded-lg border border-brand-strong text-brand-strong hover:bg-brand-strong hover:text-white transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : 'Upload Song'}
              </button>
            )}
            <input
              ref={songInputRef}
              type="file"
              accept=".mp3,.m4a,.ogg"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file, 'song')
                e.target.value = ''
              }}
            />
          </div>
        </section>
      )}
    </div>
  )
}
