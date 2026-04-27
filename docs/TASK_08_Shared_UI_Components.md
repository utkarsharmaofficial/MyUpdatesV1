# Task 08 — Shared UI Components (HeatmapCalendar, StatCards, ExpensePopup, NotesPanel)

**Goal**: Build the four reusable components that every section type (Workout, Expenses, Custom) depends on. These are the visual building blocks of the entire heatmap system. They must look and behave identically to the original MyUpdates app.

**Prerequisites**: Task 07 (utility functions — `buildYearGrid`, `getMonthLabels`, `cellColour`, `nextLevel`, `getLevelFromAmount`), Task 04 (Supabase browser client).

---

## Steps

### 1. Create `components/shared/StatCards.tsx`

A purely presentational component — no data fetching. Receives its data as props.

```typescript
interface StatCard {
  emoji: string
  value: string | number
  label: string
}

interface StatCardsProps {
  cards: [StatCard, StatCard, StatCard]
}
```

**Visual**: Three cards in a row. Each card:
- Rounded corners, `bg-surface` background, `border border-border`.
- Large emoji centred at the top.
- Bold numeric value.
- Muted label text below.

Maps exactly to the `.stats` + `.stat-card` styling from the original `style.css`.

---

### 2. Create `components/shared/NotesPanel.tsx`

Read-only panel displayed below the heatmap in Custom sections.

```typescript
interface NotesPanelProps {
  notes: string
}
```

**Visual**: A card with a "📝 Notes" label at the top and the notes text below. Matches the `.routine-notes-section` styling from the original. Background `bg-surface`, border `border-border`.

---

### 3. Create `components/shared/ExpensePopup.tsx`

Modal popup that appears when a user clicks a heatmap cell in the Expenses section.

```typescript
interface ExpensePopupProps {
  date: string            // YYYY-MM-DD — shown as the popup header
  currentAmount: number   // pre-fills the input so the user sees the existing value
  onSave: (amount: number) => void
  onClose: () => void
}
```

**Visual** (matches original `.expense-popup`):
- Semi-transparent overlay (`position: fixed; inset: 0; background: rgba(0,0,0,0.3)`).
- White card centred on screen.
- Date header at the top.
- ₹ symbol + numeric input field.
- Two buttons: **Save** (`bg-brand-strong text-white`) and **Cancel** (outlined).

**Behaviour**:
- Input is pre-filled with `currentAmount` (0 for an empty day).
- Clicking Save calls `onSave(parsedAmount)`.
- Clicking Cancel or the overlay calls `onClose()`.
- Only non-negative numbers are allowed (input type="number" min="0").

---

### 4. Create `components/shared/HeatmapCalendar.tsx`

The most complex shared component. Renders a 52-week × 7-day heatmap grid.

```typescript
'use client'

interface HeatmapCalendarProps {
  sectionId: string
  type: 'workout' | 'expenses' | 'custom'
  onEntryChange?: () => void  // called after every successful write so stats can recompute
}
```

**Internal state**:
- `year: number` — currently displayed year, initialised to the current year.
- `entries: Record<string, number>` — `{ "YYYY-MM-DD": level | amount }` for the visible year.
- `loading: boolean` — true while fetching entries from Supabase.
- `popupDate: string | null` — the date string for which the ExpensePopup is open (expenses only).
- `popupAmount: number` — current amount for the popup date.

**On mount and on `year` change**:
```
supabase.from('entries')
  .select('entry_date, level, amount')
  .eq('section_id', sectionId)
  .gte('entry_date', `${year}-01-01`)
  .lte('entry_date', `${year}-12-31`)
```
Build `entries` map:
- Workout/Custom: `entries[key] = row.level`
- Expenses: `entries[key] = row.amount`

**Grid rendering**:
- Use `buildYearGrid(year)` from `lib/utils.ts` to get the weeks array (Monday-first: Mon=row 0 … Sun=row 6).
- For the **current year**, clip the weeks array to only include weeks whose Monday is ≤ today — the grid ends at the current week, not Dec 31. Past years always show the full grid.
- Month labels row: use `getMonthLabels(weeks)` — print label only when a new month starts. Because the grid is clipped, labels naturally end at the current month.
- Day labels column: Mon, Tue, Wed, Thu, Fri, Sat, Sun. Show **Mon, Wed, Fri, Sun** only for compactness (GitHub/LeetCode style).
- Each cell: a `<div>` with `width: 12px; height: 12px; border-radius: 3px`.
  - Colour: `cellColour(level)` for workout/custom, `cellColour(getLevelFromAmount(amount))` for expenses.
  - Future dates (after today): always colour `#F5EDE9`, non-clickable.
- The entire heatmap is wrapped in a card: `bg-surface border border-border rounded-xl p-4`.
- Legend is aligned to the **bottom-right** of the card.

**Cell click handler**:
- Workout/Custom: compute `nextLevel(currentLevel)` → `upsert entry` in Supabase → update local `entries` state → call `onEntryChange()`.
- Expenses: set `popupDate = dateKey`, `popupAmount = entries[dateKey] ?? 0` → renders `<ExpensePopup />`.

**Year navigation**:
- Previous year button (‹): `setYear(year - 1)`.
- Next year button (›): `setYear(year + 1)`. Disable the next button if `year >= currentYear`.

**Contributions count** (same as original):
- Workout/Custom: show "X workouts this year" / "X days this year" next to the title.
- Expenses: show "X days tracked this year".

**Legend** (below the grid):
```
Less  [#F5EDE9] [#FBA98E] [#F86A3A] [#F64409]  More
```

**Upsert logic** (shared for all types):
```typescript
await supabase.from('entries').upsert({
  section_id: sectionId,
  user_id: userId,       // from supabase.auth.getUser()
  entry_date: dateKey,
  level: type !== 'expenses' ? newLevel : getLevelFromAmount(amount),
  amount: type === 'expenses' ? amount : null,
}, { onConflict: 'section_id,entry_date' })
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/shared/StatCards.tsx` | Created |
| `components/shared/NotesPanel.tsx` | Created |
| `components/shared/ExpensePopup.tsx` | Created |
| `components/shared/HeatmapCalendar.tsx` | Created |

---

## Done When

- [ ] `<StatCards>` renders 3 cards side by side. Emoji, value, and label are visible. Styling matches original.
- [ ] `<NotesPanel>` renders the notes text in a card with the 📝 label.
- [ ] `<ExpensePopup>` opens as an overlay, shows the date, pre-fills the current amount, saves correctly, and closes on Cancel/overlay click.
- [ ] `<HeatmapCalendar>` renders a full 52-week grid for the current year with correct month labels and day labels.
- [ ] Empty cells show `#F5EDE9`. Future cells are non-clickable.
- [ ] Clicking a Workout/Custom cell cycles colours 0→1→2→3→0. The change persists after page refresh (check Supabase `entries` table for the new row).
- [ ] Year navigation arrows switch the year and re-fetch entries. Next arrow is disabled on the current year.
- [ ] Legend is visible below the grid.
- [ ] No TypeScript errors.
