# Task 07 — Utility Functions

**Goal**: Write all shared calculation logic in `lib/utils.ts`. These functions are used by every section component (streak calculations, level mapping, media fallback) and must be correct before any section is built.

**Prerequisites**: Task 01 (project exists). Task 03 (defaults.ts exists for the media resolver types).

---

## Steps

### 1. Create `lib/utils.ts`

Write and export the following functions:

---

#### Date Helpers

```typescript
/** Returns the date as a "YYYY-MM-DD" key string. */
export function toKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Returns today's date at midnight local time. */
export function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Zero-pads a number to 2 digits. */
export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Formats seconds as "M:SS". */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${pad(s)}`
}
```

---

#### Streak Calculators
These operate on a `Record<string, number>` where keys are `"YYYY-MM-DD"` strings and values are levels (≥ 1 = "done that day").

```typescript
/** Number of consecutive days up to and including today with level > 0. */
export function getCurrentStreak(entries: Record<string, number>): number {
  let streak = 0
  const cursor = today()
  while (true) {
    const key = toKey(cursor)
    if ((entries[key] ?? 0) > 0) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

/** Maximum number of consecutive days with level > 0, across all time. */
export function getLongestStreak(entries: Record<string, number>): number {
  if (Object.keys(entries).length === 0) return 0

  const sortedKeys = Object.keys(entries)
    .filter(k => entries[k] > 0)
    .sort()

  let longest = 0
  let current = 0
  let prev: Date | null = null

  for (const key of sortedKeys) {
    const [y, m, d] = key.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    if (prev) {
      const diff = (date.getTime() - prev.getTime()) / 86400000
      current = diff === 1 ? current + 1 : 1
    } else {
      current = 1
    }
    longest = Math.max(longest, current)
    prev = date
  }
  return longest
}

/** Total number of days with level > 0. */
export function getTotalCount(entries: Record<string, number>): number {
  return Object.values(entries).filter(v => v > 0).length
}
```

---

#### Expense Calculators
These operate on a `Record<string, number>` where values are amounts in ₹.

```typescript
/** Today's spending amount. */
export function getDailyAmount(entries: Record<string, number>): number {
  return entries[toKey(today())] ?? 0
}

/** Total spending for the current calendar month. */
export function getMonthlyTotal(entries: Record<string, number>): number {
  const now = today()
  const ym = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`
  return Object.entries(entries)
    .filter(([k]) => k.startsWith(ym))
    .reduce((sum, [, v]) => sum + v, 0)
}

/** Total spending for the current calendar year. */
export function getYearlyTotal(entries: Record<string, number>): number {
  const y = String(today().getFullYear())
  return Object.entries(entries)
    .filter(([k]) => k.startsWith(y))
    .reduce((sum, [, v]) => sum + v, 0)
}
```

---

#### Level Calculators

```typescript
/** Heatmap level from a spending amount (used by Expenses section). */
export function getLevelFromAmount(amount: number): 0 | 1 | 2 | 3 {
  if (amount <= 0)    return 0
  if (amount <= 500)  return 1
  if (amount <= 1500) return 2
  return 3
}

/** Next cycle level for Workout / Custom sections (0→1→2→3→0). */
export function nextLevel(current: number): 0 | 1 | 2 | 3 {
  return ((current + 1) % 4) as 0 | 1 | 2 | 3
}

/** Hex colour for a given heatmap level. */
export function cellColour(level: 0 | 1 | 2 | 3): string {
  return ['#F5EDE9', '#FBA98E', '#F86A3A', '#F64409'][level]
}
```

---

#### Media Resolver

```typescript
import { DEFAULT_IMAGES, DEFAULT_SONGS } from '@/lib/defaults'

export interface UserMediaItem {
  id: string
  type: 'image' | 'song'
  public_url: string
  display_name: string
}

/** Returns user images if any exist, otherwise the 10 defaults. */
export function resolveImages(userMedia: UserMediaItem[]): { url: string; alt: string }[] {
  const images = userMedia.filter(m => m.type === 'image')
  if (images.length === 0) return DEFAULT_IMAGES
  return images.map(m => ({ url: m.public_url, alt: m.display_name }))
}

/** Returns user songs if any exist, otherwise the 3 defaults. */
export function resolveSongs(userMedia: UserMediaItem[]): { name: string; url: string }[] {
  const songs = userMedia.filter(m => m.type === 'song')
  if (songs.length === 0) return DEFAULT_SONGS
  return songs.map(m => ({ name: m.display_name, url: m.public_url }))
}
```

---

#### Heatmap Grid Builder
Used by HeatmapCalendar to generate the 52-week grid structure:

```typescript
/**
 * Returns an array of 52 weeks, each with 7 days.
 * The first day of the first week is the Sunday on or before Jan 1 of the given year.
 */
export function buildYearGrid(year: number): Date[][] {
  const jan1 = new Date(year, 0, 1)
  // Start on the Sunday before (or on) Jan 1
  const startDay = new Date(jan1)
  startDay.setDate(jan1.getDate() - jan1.getDay())

  const weeks: Date[][] = []
  const cursor = new Date(startDay)
  for (let w = 0; w < 53; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (cursor.getFullYear() > year && cursor.getDay() === 0) break
  }
  return weeks
}

/** Returns the abbreviated month label for each week's first day that starts a new month. */
export function getMonthLabels(weeks: Date[][]): (string | null)[] {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  let lastMonth = -1
  return weeks.map(week => {
    const m = week[0].getMonth()
    if (m !== lastMonth) { lastMonth = m; return MONTHS[m] }
    return null
  })
}
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `lib/utils.ts` | Created — all utility functions |

---

## Done When

- [ ] `lib/utils.ts` exports all functions listed above.
- [ ] `toKey(new Date('2026-04-26'))` returns `'2026-04-26'`.
- [ ] `getCurrentStreak({ '2026-04-26': 2, '2026-04-25': 1 })` returns `2` (tested on 2026-04-26).
- [ ] `getLongestStreak({ '2026-01-01': 1, '2026-01-02': 1, '2026-01-04': 1 })` returns `2`.
- [ ] `getTotalCount({ '2026-04-26': 3, '2026-04-25': 0 })` returns `1`.
- [ ] `getLevelFromAmount(0)` returns `0`, `getLevelFromAmount(300)` returns `1`, `getLevelFromAmount(800)` returns `2`, `getLevelFromAmount(2000)` returns `3`.
- [ ] `resolveImages([])` returns the 10-item `DEFAULT_IMAGES` array.
- [ ] `resolveImages([{ type: 'image', public_url: 'x', ... }])` returns the single custom image.
- [ ] No TypeScript errors (`npx tsc --noEmit`).
