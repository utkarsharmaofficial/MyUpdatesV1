# Task 16 — Remove Section

**Goal**: Implement the × remove button on dynamic section tabs. Clicking it shows a confirmation dialog. On confirm, the section and all its entries are deleted from Supabase, and the tab disappears. The Daily Tasks tab is never removable.

**Prerequisites**: Task 14 (NavBar renders tabs with `onRemoveSection` prop already wired up as a stub).

---

## Steps

### 1. Add the remove button to `NavBar.tsx`

Each dynamic section tab (not Daily Tasks) should show a `×` button. It is visible on tab hover.

```tsx
<div
  key={section.id}
  className={`nav-tab-wrapper group relative ${activeId === section.id ? 'active' : ''}`}
>
  <button
    onClick={() => onTabChange(section.id)}
    className="nav-tab"
  >
    {section.name}
  </button>

  {/* Remove button — visible on group hover */}
  <button
    onClick={(e) => {
      e.stopPropagation()
      onRemoveSection(section.id)
    }}
    className="remove-btn opacity-0 group-hover:opacity-100 transition-opacity"
    title={`Remove ${section.name}`}
    aria-label={`Remove ${section.name}`}
  >
    ×
  </button>
</div>
```

Tailwind classes for the remove button:
- `absolute top-0.5 right-0.5`
- `w-4 h-4 rounded-full`
- `bg-app-muted text-white text-xs leading-none`
- `flex items-center justify-center`
- `hover:bg-brand-strong`

### 2. Implement `handleRemoveSection` in `Dashboard.tsx`

This function was a stub in Task 14. Now implement it fully:

```typescript
async function handleRemoveSection(id: string) {
  const section = sections.find(s => s.id === id)
  if (!section) return

  // Confirm dialog
  const confirmed = window.confirm(
    `Remove "${section.name}"? All recorded data will be permanently deleted.`
  )
  if (!confirmed) return

  // Delete from Supabase (entries cascade via ON DELETE CASCADE)
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', id)

  if (error) {
    alert(`Failed to remove section: ${error.message}`)
    return
  }

  // Update local state
  setSections(prev => prev.filter(s => s.id !== id))

  // If the removed section was active, switch to Daily Tasks
  if (activeId === id) {
    setActiveId('daily-tasks')
  }
}
```

**Note on `window.confirm`**: This is acceptable for V1 (simple and works everywhere). A custom modal confirmation can be used as a polish improvement later.

### 3. Verify cascade delete

When a section is deleted from the `sections` table, all rows in `entries` where `entries.section_id = section.id` are automatically deleted due to the `ON DELETE CASCADE` defined on the `entries.section_id` foreign key (set up in Task 02). No extra delete call is needed for entries.

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/dashboard/NavBar.tsx` | Modified — × button added to dynamic tabs |
| `components/dashboard/Dashboard.tsx` | Modified — `handleRemoveSection` fully implemented |

---

## Done When

- [ ] Hovering over a dynamic section tab reveals a small × button.
- [ ] The Daily Tasks tab has NO × button.
- [ ] Clicking × shows a `confirm()` dialog with the section name and a warning.
- [ ] Clicking Cancel on the dialog does nothing — the tab remains.
- [ ] Clicking OK on the dialog removes the tab from the nav bar.
- [ ] After deletion, the active tab switches to Daily Tasks (if the removed section was active).
- [ ] The deleted section's entries no longer appear in the Supabase `entries` table (verify in Supabase dashboard).
- [ ] After removal, the `+ Add Section` button becomes enabled again if it was at the 3-section limit.
- [ ] Creating a new section after deleting one works correctly (positions update).
- [ ] No TypeScript errors.
