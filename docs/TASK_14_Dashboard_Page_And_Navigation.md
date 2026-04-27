# Task 14 — Dashboard Page & Section Navigation

**Goal**: Build the main dashboard page and the dynamic navigation bar. The dashboard is the orchestrator that holds all section components. The nav bar renders tabs dynamically based on the user's sections. Daily Tasks is always first. Active tab state drives which section body is shown.

**Prerequisites**: Task 09 (DailyTasks), Task 10 (WorkoutSection), Task 11 (ExpensesSection), Task 12 (CustomSection) — all section components must exist. Task 05 (auth, so the server component can get the user's sections).

---

## Steps

### 1. Create `components/dashboard/NavBar.tsx`

A Client Component that receives the section list and manages the active tab.

**Props**:
```typescript
interface Section {
  id: string
  type: 'workout' | 'expenses' | 'custom'
  name: string
  notes: string | null
  position: number
}

interface NavBarProps {
  sections: Section[]
  activeId: string
  onTabChange: (id: string) => void
  onAddSectionClick: () => void
  onRemoveSection: (id: string) => void
  canAddMore: boolean  // false when sections.length >= 3
}
```

**Visual layout** (matches original `.main-nav` row):
- Always-first tab: `✅ Daily Tasks` — no remove button, cannot be deselected to nothing.
- User section tabs: each has the section name as the label and a small `×` button visible on hover.
- `+ Add Section` button at the end: grey/disabled when `canAddMore = false`, with tooltip text "Maximum 3 sections reached."
- Active tab gets `border-b-2 border-brand-strong text-brand-strong`.
- Inactive tabs get `text-app-muted hover:text-app-text`.

**Tab IDs**: Use `'daily-tasks'` as the fixed ID for the Daily Tasks tab, and `section.id` (the Supabase UUID) for dynamic tabs.

---

### 2. Create `components/dashboard/SectionBody.tsx`

A Client Component that renders the correct section based on the active tab ID.

**Props**:
```typescript
interface SectionBodyProps {
  activeId: string
  sections: Section[]
  initialTasks: Task[]  // passed down to DailyTasks
}
```

**Rendering logic**:
```typescript
if (activeId === 'daily-tasks') {
  return <DailyTasks initialTasks={initialTasks} />
}

const section = sections.find(s => s.id === activeId)
if (!section) return null

if (section.type === 'workout') {
  return <WorkoutSection sectionId={section.id} sectionName={section.name} />
}
if (section.type === 'expenses') {
  return <ExpensesSection sectionId={section.id} sectionName={section.name} />
}
if (section.type === 'custom') {
  return <CustomSection sectionId={section.id} sectionName={section.name} notes={section.notes ?? ''} />
}
```

---

### 3. Create `components/dashboard/Dashboard.tsx`

A Client Component that owns the shared state: active tab and section list.

**Props**:
```typescript
interface DashboardProps {
  initialSections: Section[]
  initialTasks: Task[]
}
```

**Internal state**:
- `sections: Section[]` — starts from `initialSections`. Updated when user adds or removes sections.
- `activeId: string` — the ID of the currently visible section. Defaults to `'daily-tasks'`.
- `modalOpen: boolean` — controls the Add Section modal visibility.

**Layout**:
```tsx
<>
  <NavBar
    sections={sections}
    activeId={activeId}
    onTabChange={setActiveId}
    onAddSectionClick={() => setModalOpen(true)}
    onRemoveSection={handleRemoveSection}
    canAddMore={sections.length < 3}
  />

  <div className="sections-container">
    <SectionBody activeId={activeId} sections={sections} initialTasks={initialTasks} />
  </div>

  {modalOpen && (
    <AddSectionModal
      onClose={() => setModalOpen(false)}
      onSectionAdded={(newSection) => {
        setSections(prev => [...prev, newSection])
        setActiveId(newSection.id)
        setModalOpen(false)
      }}
    />
  )}
</>
```

**handleRemoveSection** (implemented in Task 16):
```typescript
async function handleRemoveSection(id: string) {
  // Supabase delete + update sections state + reset activeId to 'daily-tasks'
}
```
Define it as a stub here; fully implement in Task 16.

---

### 4. Create `app/dashboard/page.tsx`

A Server Component that pre-fetches data and passes it to `<Dashboard>`.

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Dashboard from '@/components/dashboard/Dashboard'
import { toKey, today } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ data: sections }, { data: tasks }] = await Promise.all([
    supabase.from('sections').select('*').eq('user_id', user.id).order('position'),
    supabase.from('tasks').select('*').eq('user_id', user.id).eq('task_date', toKey(today())),
  ])

  return (
    <Dashboard
      initialSections={sections ?? []}
      initialTasks={tasks ?? []}
    />
  )
}
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/dashboard/NavBar.tsx` | Created — dynamic tabs, + Add Section button |
| `components/dashboard/SectionBody.tsx` | Created — renders correct section by active ID |
| `components/dashboard/Dashboard.tsx` | Created — section list + active tab state |
| `app/dashboard/page.tsx` | Created — server pre-fetch + passes data to Dashboard |

---

## Done When

- [ ] `/dashboard` loads and shows the "✅ Daily Tasks" tab as active by default.
- [ ] Daily Tasks section content is visible below the nav tabs.
- [ ] If the user has existing sections in Supabase, those tabs appear in the nav bar.
- [ ] Clicking a tab switches the section body.
- [ ] `+ Add Section` button is visible (even if modal is not built yet — clicking shows nothing yet; modal is Task 15).
- [ ] `+ Add Section` button is visually disabled when `sections.length >= 3`.
- [ ] On hover of a dynamic section tab, a `×` button appears (remove logic in Task 16).
- [ ] No TypeScript errors.
