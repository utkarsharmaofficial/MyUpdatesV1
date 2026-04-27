# Task 11 — Expenses Section

**Goal**: Build the Expenses section component — stat cards (Daily Spending, Monthly Spending, Yearly Spending) + heatmap calendar with the ₹ amount popup on cell click. Data is stored in Supabase `entries.amount`.

**Prerequisites**: Task 08 (HeatmapCalendar + StatCards + ExpensePopup built).

---

## Steps

### 1. Create `components/sections/ExpensesSection.tsx`

A Client Component (`'use client'`).

**Props**:
```typescript
interface ExpensesSectionProps {
  sectionId: string
  sectionName: string  // e.g. "💰 Expenses"
}
```

**Internal state**:
- `entries: Record<string, number>` — all entries for this section (all dates, value = amount in ₹).

**How entries are fetched for stats**:
Same pattern as Workout: fetch all entries for this section (all years) so yearly/monthly totals are accurate:
```typescript
const { data } = await supabase
  .from('entries')
  .select('entry_date, amount')
  .eq('section_id', sectionId)

const entriesMap: Record<string, number> = {}
data?.forEach(r => { entriesMap[r.entry_date] = r.amount ?? 0 })
setEntries(entriesMap)
```
Re-fetch on `onEntryChange`.

**Stat cards configuration**:
```typescript
const cards = [
  { emoji: '💸', value: `₹${getDailyAmount(entries)}`,   label: 'Daily Spending'   },
  { emoji: '📅', value: `₹${getMonthlyTotal(entries)}`,  label: 'Monthly Spending' },
  { emoji: '📊', value: `₹${getYearlyTotal(entries)}`,   label: 'Yearly Spending'  },
]
```

**Layout**:
```
[Section heading: sectionName]
[StatCards — 3 cards]
[HeatmapCalendar type="expenses" sectionId={sectionId} onEntryChange={refetchEntries}]
```

The `<HeatmapCalendar>` handles the popup internally (the `ExpensePopup` is rendered inside `HeatmapCalendar` when `type="expenses"`). The `onEntryChange` callback is all this component needs to re-fetch stats.

**Colour thresholds** (defined in `getLevelFromAmount` in `lib/utils.ts`, used inside HeatmapCalendar):
- ₹0 → level 0 → `#F5EDE9` (empty)
- ₹1–500 → level 1 → `#FBA98E`
- ₹501–1500 → level 2 → `#F86A3A`
- ₹1501+ → level 3 → `#F64409`

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/sections/ExpensesSection.tsx` | Created |

---

## Done When

- [ ] Expenses section renders with 3 stat cards (₹0 initial values) and the heatmap.
- [ ] Clicking a heatmap cell opens the ExpensePopup for that date.
- [ ] Entering a ₹ amount and clicking Save closes the popup and changes the cell colour.
- [ ] Stat cards update: Daily Spending shows today's amount if entered for today.
- [ ] Monthly and Yearly totals accumulate correctly across multiple entries.
- [ ] Saving ₹0 resets the cell to empty.
- [ ] Data persists after page refresh.
- [ ] No TypeScript errors.
