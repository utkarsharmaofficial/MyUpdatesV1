# Task 10 — Workout Section

**Goal**: Build the Workout section component — stat cards (Current Streak, Longest Streak, Total Workouts) + heatmap calendar. Clicking a cell cycles through levels 0→1→2→3→0. All data in Supabase.

**Prerequisites**: Task 08 (HeatmapCalendar + StatCards built).

---

## Steps

### 1. Create `components/sections/WorkoutSection.tsx`

A Client Component (`'use client'`).

**Props**:
```typescript
interface WorkoutSectionProps {
  sectionId: string
  sectionName: string  // e.g. "🏋️ Workout" — used as the section heading
}
```

**Internal state**:
- `entries: Record<string, number>` — loaded from Supabase, passed to stat calculators.
  - Key: `"YYYY-MM-DD"`, Value: level (0–3).
- Entries are refreshed by listening to the `onEntryChange` callback from `<HeatmapCalendar>`.

**How entries are fetched for stats**:
The `<HeatmapCalendar>` internally manages its own year-scoped entries fetch for rendering. For the stat cards, fetch **all entries** for this section (all years) so that `getLongestStreak` works across years:
```typescript
const { data } = await supabase
  .from('entries')
  .select('entry_date, level')
  .eq('section_id', sectionId)

const entriesMap: Record<string, number> = {}
data?.forEach(r => { entriesMap[r.entry_date] = r.level })
setEntries(entriesMap)
```
Fetch on mount and re-fetch when `onEntryChange` is called.

**Stat cards configuration**:
```typescript
const cards = [
  { emoji: '🔥', value: getCurrentStreak(entries),  label: 'Current Streak' },
  { emoji: '🏆', value: getLongestStreak(entries),  label: 'Longest Streak' },
  { emoji: '💪', value: getTotalCount(entries),     label: 'Total Workouts' },
]
```

**Layout**:
```
[Section heading: sectionName]
[StatCards — 3 cards]
[HeatmapCalendar type="workout" sectionId={sectionId} onEntryChange={refetchEntries}]
```

Matches the original GYM Updates section layout exactly.

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/sections/WorkoutSection.tsx` | Created |

---

## Done When

- [ ] Workout section renders with 3 stat cards and the heatmap calendar below.
- [ ] Initial stat values are all 0 for a new section.
- [ ] Clicking a cell cycles colours (0=empty, 1=light, 2=mid, 3=strong).
- [ ] After clicking, stat cards update: Current Streak and Total Workouts increase.
- [ ] Clicking the cell again cycles back (3→0 resets the cell to empty, streak drops).
- [ ] Year navigation in the heatmap works.
- [ ] Data persists after page refresh.
- [ ] Longest Streak computes correctly across multiple days.
- [ ] No TypeScript errors.
