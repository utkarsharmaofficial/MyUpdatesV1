'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { formatTime } from '@/lib/utils'

interface Song {
  name: string
  url: string
}

interface MusicPlayerProps {
  songs: Song[]
}

export default function MusicPlayer({ songs }: MusicPlayerProps) {
  const audioRef                        = useRef<HTMLAudioElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying]       = useState(false)
  const [isLooping, setIsLooping]       = useState(false)
  const [currentTime, setCurrentTime]   = useState(0)
  const [duration, setDuration]         = useState(0)

  // Initialise audio on mount
  useEffect(() => {
    if (songs.length === 0) return
    audioRef.current = new Audio(songs[0].url)
    const audio = audioRef.current

    const onTimeUpdate  = () => setCurrentTime(audio.currentTime)
    const onMetadata    = () => setDuration(audio.duration)
    const onEnded       = () => {
      if (audio.loop) return
      setCurrentIndex(i => (i + 1) % songs.length)
      setIsPlaying(true)
    }

    audio.addEventListener('timeupdate',     onTimeUpdate)
    audio.addEventListener('loadedmetadata', onMetadata)
    audio.addEventListener('ended',          onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate',     onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onMetadata)
      audio.removeEventListener('ended',          onEnded)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Change song when currentIndex changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || songs.length === 0) return
    audio.src = songs[currentIndex].url
    audio.load()
    setCurrentTime(0)
    setDuration(0)
    if (isPlaying) audio.play().catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex])

  // Sync loop flag
  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = isLooping
  }, [isLooping])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch(() => {})
      setIsPlaying(true)
    }
  }, [isPlaying])

  function prevSong() {
    setCurrentIndex(i => (i - 1 + songs.length) % songs.length)
    setIsPlaying(true)
  }

  function nextSong() {
    setCurrentIndex(i => (i + 1) % songs.length)
    setIsPlaying(true)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    audio.currentTime = percent * duration
  }

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0
  const currentSong = songs[currentIndex]

  if (songs.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-border h-[72px] flex items-center justify-center">
        <span className="text-xs text-app-muted">No songs available</span>
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-border h-[72px] flex items-center px-5 gap-4">
      {/* Icon */}
      <span className="text-brand-mid text-lg select-none flex-shrink-0">♪</span>

      {/* Song info */}
      <div className="flex flex-col min-w-0 flex-shrink-0 w-40">
        <span className="text-xs font-medium text-app-text truncate">
          {currentSong?.name ?? '—'}
        </span>
        <span className="text-[10px] text-app-muted">
          {currentIndex + 1} / {songs.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="flex-1 h-1.5 bg-empty rounded-full overflow-hidden cursor-pointer"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-brand-strong rounded-full transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Time */}
      <span className="text-[10px] text-app-muted flex-shrink-0 tabular-nums">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={prevSong}
          className="text-app-muted hover:text-brand-strong transition-colors text-base"
          title="Previous"
        >
          ⏮
        </button>
        <button
          onClick={togglePlay}
          className="text-brand-strong hover:text-brand-mid transition-colors text-xl"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={nextSong}
          className="text-app-muted hover:text-brand-strong transition-colors text-base"
          title="Next"
        >
          ⏭
        </button>
        <button
          onClick={() => setIsLooping(l => !l)}
          className={`text-base transition-all rounded-md px-1 py-0.5 ${isLooping ? 'bg-brand-strong' : 'text-app-muted hover:text-brand-strong'}`}
          title={isLooping ? 'Loop on' : 'Loop off'}
        >
          🔁
        </button>
      </div>
    </div>
  )
}
