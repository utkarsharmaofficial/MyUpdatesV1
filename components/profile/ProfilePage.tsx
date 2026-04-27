'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { type UserMediaItem } from '@/lib/utils'

interface ProfilePageProps {
  initialMedia: UserMediaItem[]
  userId: string
}

const IMAGE_LIMIT = 10
const SONG_LIMIT  = 5
const IMAGE_MAX_BYTES = 5  * 1024 * 1024  // 5 MB
const SONG_MAX_BYTES  = 20 * 1024 * 1024  // 20 MB

export default function ProfilePage({ initialMedia, userId }: ProfilePageProps) {
  const [media, setMedia]       = useState<UserMediaItem[]>(initialMedia)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting]  = useState<string | null>(null)
  const [error, setError]        = useState<string | null>(null)

  const imageInputRef  = useRef<HTMLInputElement>(null)
  const songInputRef   = useRef<HTMLInputElement>(null)
  const previewAudio   = useRef<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const router = useRouter()
  const images = media.filter(m => m.type === 'image')
  const songs  = media.filter(m => m.type === 'song')

  const supabase = createClient()

  // Stop preview when component unmounts (navigating away)
  useEffect(() => {
    return () => {
      previewAudio.current?.pause()
      previewAudio.current = null
    }
  }, [])

  async function handleUpload(file: File, type: 'image' | 'song') {
    setError(null)

    const maxBytes = type === 'image' ? IMAGE_MAX_BYTES : SONG_MAX_BYTES
    const limitMB  = type === 'image' ? 5 : 20
    if (file.size > maxBytes) {
      setError(`${type === 'image' ? 'Image' : 'Song'} must be under ${limitMB} MB.`)
      return
    }

    const count = type === 'image' ? images.length : songs.length
    const limit = type === 'image' ? IMAGE_LIMIT : SONG_LIMIT
    if (count >= limit) return

    setUploading(true)
    const ext  = file.name.split('.').pop()
    const folder = type === 'image' ? 'images' : 'songs'
    const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`

    const { error: storageError } = await supabase
      .storage.from('user-media').upload(path, file)
    if (storageError) { setError(storageError.message); setUploading(false); return }

    const { data: urlData } = supabase
      .storage.from('user-media').getPublicUrl(path)

    const { data: row, error: dbError } = await supabase
      .from('user_media')
      .insert({
        user_id:      userId,
        type,
        storage_path: path,
        public_url:   urlData.publicUrl,
        display_name: file.name,
      })
      .select()
      .single()

    if (dbError) { setError(dbError.message); setUploading(false); return }

    // Generate a signed URL so the new item displays immediately without a page refresh
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

    const { error: storageError } = await supabase
      .storage.from('user-media').remove([item.storage_path])
    if (storageError) { setError(storageError.message); setDeleting(null); return }

    await supabase.from('user_media').delete().eq('id', item.id)

    setMedia(prev => prev.filter(m => m.id !== item.id))
    setDeleting(null)
  }

  function playPreview(item: UserMediaItem) {
    // If this song is already playing, pause it
    if (playingId === item.id) {
      previewAudio.current?.pause()
      setPlayingId(null)
      return
    }

    // Stop whatever was playing before
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

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Back link */}
      <button
        onClick={handleBackToDashboard}
        className="text-sm text-app-muted hover:text-brand-strong transition-colors self-start"
      >
        ← Back to Dashboard
      </button>

      <h1 className="text-xl font-semibold text-app-text">Your Media</h1>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <div className="flex flex-col md:flex-row gap-6">

        {/* ── Images Panel ─────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 p-5 bg-surface border border-border rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-app-text">
              🖼️ Images ({images.length} / {IMAGE_LIMIT})
            </h2>
          </div>

          {/* Thumbnail grid */}
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
                  title="Delete image"
                >
                  {deleting === img.id ? '…' : '🗑'}
                </button>
              </div>
            ))}
          </div>

          {/* Upload button */}
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

        {/* ── Songs Panel ──────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4 p-5 bg-surface border border-border rounded-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-app-text">
              🎵 Songs ({songs.length} / {SONG_LIMIT})
            </h2>
          </div>

          {/* Song list */}
          <div className="flex flex-col gap-2">
            {songs.map(song => (
              <div
                key={song.id}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg"
              >
                <button
                  onClick={() => playPreview(song)}
                  className="text-brand-mid hover:text-brand-strong transition-colors text-sm flex-shrink-0 w-5 text-center"
                  title={playingId === song.id ? 'Pause' : 'Play'}
                >
                  {playingId === song.id ? '⏸' : '▶'}
                </button>
                <span className="flex-1 text-sm text-app-text truncate" title={song.display_name}>
                  {song.display_name}
                </span>
                <button
                  onClick={() => handleDelete(song)}
                  disabled={deleting === song.id}
                  className="w-6 h-6 rounded-full bg-brand-strong text-white flex items-center justify-center text-xs hover:bg-brand-mid transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Delete song"
                >
                  {deleting === song.id ? '…' : '🗑'}
                </button>
              </div>
            ))}
          </div>

          {/* Upload button */}
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

      </div>
    </div>
  )
}
