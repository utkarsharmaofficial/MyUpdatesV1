# Task 15 — Add Section Modal

**Goal**: Build the modal that appears when the user clicks "+ Add Section". It offers three choices — Workout, Expenses, and Custom. Workout and Expenses create the section with one click. Custom requires filling a mandatory form (Section Name + Notes) before submitting.

**Prerequisites**: Task 14 (Dashboard + NavBar that call `onAddSectionClick` and `onSectionAdded`).

---

## Steps

### 1. Create `components/dashboard/CustomSectionForm.tsx`

A sub-form inside the modal for the Custom option.

**Props**:
```typescript
interface CustomSectionFormProps {
  onSubmit: (name: string, notes: string) => void
  onBack: () => void     // return to the option selection view
  loading: boolean
  error: string | null
}
```

**Fields**:

| Field | Type | Rules |
|---|---|---|
| **Section Name** | Text input | Required. Emoji supported (standard Unicode — no special handling needed; browsers support emoji input natively). Placeholder: e.g. `🚀 My Goal`. |
| **Notes** | Textarea | Required. What the user wants to track. Placeholder: e.g. `Track daily reading sessions`. |

**Submit button**:
- Disabled until BOTH fields are non-empty (after trimming whitespace).
- Label: "Create Section".
- When `loading = true`: show a spinner or "Creating…" label.

**Back link**:
- "← Back" link that calls `onBack()` and returns to the option selection.

**Error display**:
- If `error` is set (e.g. server rejected with "Section limit reached"), show it in red below the submit button.

---

### 2. Create `components/dashboard/AddSectionModal.tsx`

A Client Component (`'use client'`).

**Props**:
```typescript
interface AddSectionModalProps {
  onClose: () => void
  onSectionAdded: (section: Section) => void
}
```

**Internal state**:
- `view: 'options' | 'custom-form'` — which screen is shown inside the modal.
- `loading: boolean`
- `error: string | null`

---

**View 1: Option Selection** (`view === 'options'`):

Three option cards in a row:

| Card | Icon | Label | Sublabel |
|---|---|---|---|
| Workout | 🏋️ | Workout | Track gym sessions |
| Expenses | 💰 | Expenses | Track daily spending |
| Custom | ✏️ | Custom | Define your own |

Clicking Workout or Expenses:
```typescript
async function handleQuickCreate(type: 'workout' | 'expenses') {
  setLoading(true)
  const name = type === 'workout' ? '🏋️ Workout' : '💰 Expenses'
  const { data, error } = await supabase
    .from('sections')
    .insert({ type, name, position: currentCount + 1 })
    .select()
    .single()
  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }
  onSectionAdded(data)
}
```

Clicking Custom → `setView('custom-form')`.

**View 2: Custom Section Form** (`view === 'custom-form'`):
Render `<CustomSectionForm>` with the submission handler:
```typescript
async function handleCustomSubmit(name: string, notes: string) {
  setLoading(true)
  const { data, error } = await supabase
    .from('sections')
    .insert({ type: 'custom', name: name.trim(), notes: notes.trim(), position: currentCount + 1 })
    .select()
    .single()
  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }
  onSectionAdded(data)
}
```

---

**Modal shell styling** (same palette as original modals):
- Semi-transparent dark overlay: `position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200`.
- White card centred: `max-width: 480px; border-radius: 12px; padding: 32px; border: 1px solid var(--border)`.
- Close button (×) in the top-right corner: calls `onClose()`.
- Clicking the overlay also calls `onClose()`.

**Option cards styling**:
- Three cards side by side (or stacked on mobile).
- `bg-surface border border-border rounded-xl p-6 cursor-pointer`.
- Hover: `border-brand-strong`.
- Icon: large emoji centred.
- Label: bold, `text-app-text`.
- Sublabel: small, `text-app-muted`.

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/dashboard/CustomSectionForm.tsx` | Created |
| `components/dashboard/AddSectionModal.tsx` | Created |

---

## Done When

- [ ] Clicking "+ Add Section" opens the modal with three option cards.
- [ ] Clicking the overlay or × button closes the modal.
- [ ] Clicking **Workout**: section created, new tab appears in nav bar immediately, modal closes, active tab switches to the new Workout section.
- [ ] Clicking **Expenses**: same as Workout but for Expenses.
- [ ] Clicking **Custom**: shows the form with Section Name and Notes fields.
- [ ] Custom form: Submit button is disabled until both fields are non-empty.
- [ ] Custom form: emoji in the Section Name field is accepted and preserved.
- [ ] Custom form: clicking "← Back" returns to the option selection view.
- [ ] Custom form: on Submit, the section is created, the tab appears with the custom name (including emoji), and the modal closes.
- [ ] If already at 3 sections, `+ Add Section` button is disabled and shows tooltip. Modal cannot be opened.
- [ ] If the server rejects (trigger fires), error message appears inline in the modal.
- [ ] No TypeScript errors.
