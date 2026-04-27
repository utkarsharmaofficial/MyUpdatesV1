'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface SlideshowProps {
  imageUrls: { url: string; alt: string }[]
}

const INTERVAL_MS = 15000

export default function Slideshow({ imageUrls }: SlideshowProps) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % imageUrls.length)
    }, INTERVAL_MS)
  }, [imageUrls.length])

  useEffect(() => {
    if (imageUrls.length === 0) return
    startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [imageUrls.length, startTimer])

  function goTo(index: number) {
    setCurrent(index)
    startTimer()
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    if (e.deltaY > 0) {
      goTo((current + 1) % imageUrls.length)
    } else {
      goTo((current - 1 + imageUrls.length) % imageUrls.length)
    }
  }

  if (imageUrls.length === 0) return null

  return (
    <div
      className="relative w-full h-full"
      onWheel={handleWheel}
      style={{ cursor: 'grab' }}
    >
      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrls[current].url}
        alt={imageUrls[current].alt}
        className="w-full h-full object-cover"
        style={{ transition: 'opacity 0.5s ease' }}
      />

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 flex-wrap px-2">
        {imageUrls.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === current
                ? 'bg-brand-strong'
                : 'bg-empty border border-border-strong'
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
