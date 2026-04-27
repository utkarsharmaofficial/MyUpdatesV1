# Task 09 — Daily Tasks Section

**Goal**: Build the `DailyTasks` component — the default and always-visible section. Users add tasks, mark them complete, and the list resets each day. All data is stored in Supabase.

**Prerequisites**: Task 08 (shared components done), Task 04 (Supabase client).

---

## Steps

### 1. Create `components/sections/DailyTasks.tsx`

A Client Component (`'use client'`).

**Props**:
```typescript
interface DailyTasksProps {
  initialTasks: Task[]  // pre-fetched on the server, passed down to avoid client-side loading spinner
}

interface Task {
  id: string
  text: string
  completed: boolean
  task_date: string
  created_at: string
}
```

**Internal state**:
- `activeTasks: Task[]` — tasks with `completed = false`, shown in the active list.
- `completedTasks: Task[]` — tasks with `completed = true`, shown in the completed section.
- `newTaskText: string` — controlled input for the "+ Add Task" card.
- `adding: boolean` — shows/hides the new task text input.
- `completedOpen: boolean` — toggles the completed section visibility.
- `modal: { taskId: string; taskText: string } | null` — controls the completion note modal.
- `completionNote: string` — controlled textarea inside the modal.

Both lists are initialised from `initialTasks` split by `completed`.

---

**Visual Layout** (matches original):

**Date header**:
```
✅ Daily Tasks         [Today's date: "Sunday, April 26"]
```

**Active tasks section**:
- Label: "Active Tasks".
- Each task card:
  - Circle checkbox button (click → mark complete).
  - Task text.
  - No separate "Mark Complete" button needed — the circle IS the button.
  - Hover state: subtle background shift.
- At the bottom: an "+ Add Task" card (always visible).
  - Clicking it opens an inline text input with a "Add" button and a "×" cancel.
  - Pressing Enter also submits.

**Completion note modal**:
- Clicking the circle checkbox opens a modal (not immediately completing the task).
- Modal shows the task name, a required textarea ("Completion note *"), and two buttons: **Mark Complete** and **Cancel**.
- **Mark Complete** is disabled until the textarea is non-empty.
- Ctrl+Enter submits. Escape cancels.
- On submit: task is moved to completed with the note saved to `completion_note`.

**Completed section** (collapsible):
- Header: "Completed (N)" — clicking it toggles `completedOpen`.
- When open: list of completed task cards with strikethrough text and the completion note shown below in italic.
- Hidden by default when count = 0.

---

**Data operations**:

**Add task**:
```typescript
const { data, error } = await supabase
  .from('tasks')
  .insert({ text: newTaskText, task_date: toKey(today()) })
  .select()
  .single()
// On success: prepend to activeTasks, clear input
```

**Mark complete** (requires completion note):
```typescript
await supabase
  .from('tasks')
  .update({ completed: true, completion_note: note })
  .eq('id', taskId)
// On success: move task from activeTasks to completedTasks with note attached
```

**Date-scoping note**: The component only shows tasks for today (`task_date = today()`). Previous days' tasks remain in the DB — the app simply doesn't fetch them. There is no "delete old tasks" operation.

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/sections/DailyTasks.tsx` | Created |

---

## Done When

- [ ] The Daily Tasks section renders the date header with today's date.
- [ ] The "+ Add Task" card is visible. Clicking it shows an input field.
- [ ] Typing text and pressing Enter (or clicking Add) creates a new task card in the active list.
- [ ] The new task persists in Supabase — visible in `tasks` table in Supabase dashboard.
- [ ] After page refresh, the task still appears (data is in DB, not localStorage).
- [ ] Clicking the circle on a task opens the completion note modal.
- [ ] "Mark Complete" button is disabled until a note is entered.
- [ ] After submitting, task moves to "Completed" with strikethrough text and italic note below.
- [ ] Completed count updates correctly.
- [ ] New day (tomorrow) shows an empty active task list (test by temporarily changing `toKey(today())` to a different date).
- [ ] No TypeScript errors.
