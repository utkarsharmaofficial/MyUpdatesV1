# Task 12 — Custom Section

**Goal**: Build the Custom section component — user-defined section with a custom name (emoji + text), a notes panel, and the same heatmap + streak stats as Workout. The visual result is identical to Workout, with the section name and notes as distinguishing elements.

**Prerequisites**: Task 08 (HeatmapCalendar + StatCards + NotesPanel built), Task 10 (Workout section pattern established).

---

## Steps

### 1. Create `components/sections/CustomSection.tsx`

A Client Component (`'use client'`).

**Props**:
```typescript
interface CustomSectionProps {
  sectionId: string
  sectionName: string  // emoji + text, e.g. "🚀 Side Project"
  notes: string        // what to track — shown in NotesPanel below heatmap
}
```

**Internal state**:
- `entries: Record<string, number>` — all entries for this section (level 0–3), fetched from Supabase.

**Stat cards configuration** (identical to Workout but with different labels):
```typescript
const cards = [
  { emoji: '🔥', value: getCurrentStreak(entries),  label: 'Current Streak' },
  { emoji: '🏆', value: getLongestStreak(entries),  label: 'Longest Streak' },
  { emoji: '📅', value: getTotalCount(entries),     label: 'Total Days'     },
]
```

**Layout**:
```
[Section heading: sectionName]   ← emoji + text from section.name
[StatCards — 3 cards]
[HeatmapCalendar type="custom" sectionId={sectionId} onEntryChange={refetchEntries}]
[NotesPanel notes={notes}]       ← read-only, below the heatmap
```

**Key difference from Workout**: The `<NotesPanel>` below the heatmap shows the user's custom notes (what they are tracking). This mirrors the "Notes" panel in the original Morning Routine section.

**Key difference from Expenses**: Clicking a cell cycles levels 0→1→2→3→0 (same as Workout), NOT the ₹ popup.

**Entries fetch** — same pattern as Workout:
```typescript
const { data } = await supabase
  .from('entries')
  .select('entry_date, level')
  .eq('section_id', sectionId)

const entriesMap: Record<string, number> = {}
data?.forEach(r => { entriesMap[r.entry_date] = r.level })
setEntries(entriesMap)
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/sections/CustomSection.tsx` | Created |

---

## Done When

- [ ] Custom section renders with the user-defined name as the heading (emoji preserved).
- [ ] Stat cards show Current Streak, Longest Streak, Total Days (not "Total Workouts").
- [ ] NotesPanel is visible below the heatmap, showing the notes text entered when the section was created.
- [ ] Clicking cells cycles colours 0→1→2→3→0, same as Workout.
- [ ] Streak counts update correctly.
- [ ] Two different custom sections have independent data (different sectionIds → different entries).
- [ ] Data persists after page refresh.
- [ ] No TypeScript errors.
