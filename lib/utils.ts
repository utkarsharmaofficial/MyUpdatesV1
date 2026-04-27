import { DEFAULT_IMAGES, DEFAULT_SONGS } from '@/lib/defaults'
import { PROFILE_DEFINITIONS } from '@/lib/profiles'
import { THEME_DEFINITIONS, deriveCustomTheme, type ThemeDefinition } from '@/lib/themes'

// ── Date Helpers ─────────────────────────────────────────────

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

// ── Streak Calculators ───────────────────────────────────────

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

// ── Expense Calculators ──────────────────────────────────────

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

// ── Level Calculators ────────────────────────────────────────

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

/** Hex colour for a given heatmap level — reads current CSS vars at call site. */
export function cellColour(level: 0 | 1 | 2 | 3): string {
  return ['#F5EDE9', '#FBA98E', '#F86A3A', '#F64409'][level]
}

// ── Media Types ──────────────────────────────────────────────

export interface UserMediaItem {
  id: string
  type: 'image' | 'song' | 'logo'
  storage_path: string
  public_url: string
  display_name: string
  display_url?: string
}

export interface UserProfile {
  selected_profile:  string
  theme_color:       string
  custom_theme_c1:   string | null
  custom_theme_c2:   string | null
  custom_theme_c3:   string | null
}

// ── Profile-aware Media Resolvers ─────────────────────────────

/** Returns the image list for the current user profile. */
export function resolveImages(
  profile: UserProfile,
  userMedia: UserMediaItem[],
): { url: string; alt: string }[] {
  if (profile.selected_profile === 'custom') {
    const images = userMedia.filter(m => m.type === 'image')
    if (images.length > 0) {
      return images.map(m => ({ url: m.display_url ?? m.public_url, alt: m.display_name }))
    }
    return DEFAULT_IMAGES
  }
  const def = PROFILE_DEFINITIONS[profile.selected_profile]
  return def?.images ?? DEFAULT_IMAGES
}

/** Returns the song list for the current user profile. */
export function resolveSongs(
  profile: UserProfile,
  userMedia: UserMediaItem[],
): { name: string; url: string }[] {
  if (profile.selected_profile === 'custom') {
    const songs = userMedia.filter(m => m.type === 'song')
    if (songs.length > 0) {
      return songs.map(m => ({ name: m.display_name, url: m.display_url ?? m.public_url }))
    }
    return DEFAULT_SONGS
  }
  const def = PROFILE_DEFINITIONS[profile.selected_profile]
  if (!def || def.songs.length === 0) return DEFAULT_SONGS
  return def.songs
}

/** Returns the logo path for the current user profile. */
export function resolveLogoPath(
  profile: UserProfile,
  userMedia: UserMediaItem[],
): string {
  if (profile.selected_profile === 'custom') {
    const logo = userMedia.find(m => m.type === 'logo')
    if (logo) return logo.display_url ?? logo.public_url
    return '/logo/HanumanJiLogo.jpeg'
  }
  const def = PROFILE_DEFINITIONS[profile.selected_profile]
  return def?.logoPath ?? '/logo/HanumanJiLogo.jpeg'
}

/** Returns the resolved ThemeDefinition for the current user profile. */
export function resolveTheme(profile: UserProfile): ThemeDefinition {
  if (profile.theme_color === 'custom' && profile.custom_theme_c3) {
    return deriveCustomTheme(
      profile.custom_theme_c3,
      profile.custom_theme_c1,
      profile.custom_theme_c2,
    )
  }
  return THEME_DEFINITIONS[profile.theme_color] ?? THEME_DEFINITIONS.orange
}

// ── Heatmap Grid Builder ─────────────────────────────────────

/**
 * Returns an array of up to 53 weeks, each with 7 days (Monday-first).
 * The first day of the first week is the Monday on or before Jan 1 of the given year.
 * Row order: Mon(0) Tue(1) Wed(2) Thu(3) Fri(4) Sat(5) Sun(6).
 */
export function buildYearGrid(year: number): Date[][] {
  const jan1 = new Date(year, 0, 1)
  const startDay = new Date(jan1)
  startDay.setDate(jan1.getDate() - ((jan1.getDay() + 6) % 7))

  const weeks: Date[][] = []
  const cursor = new Date(startDay)
  for (let w = 0; w < 53; w++) {
    const week: Date[] = []
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
    if (cursor.getFullYear() > year && cursor.getDay() === 1) break
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
