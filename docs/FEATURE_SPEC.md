# Feature Specification — MyUpdates V1

> This document describes every feature in V1 in plain language, linked back to the relevant tech decisions in TECH_STACK.md.
> **Date**: 2026-04-26

---

## 1. Authentication

### What it does
Users create an account with email and password, then log in to access their personal dashboard. Each user's data is completely isolated from every other user's data.

### Behaviour
- The app root (`/`) always shows a login/register form if the user is not authenticated.
- After a successful login or sign-up, the user is redirected to `/dashboard`.
- Sessions persist across browser refreshes (cookie-based JWT managed by Supabase Auth).
- Logout clears the session and redirects to `/`.
- No OAuth (Google / GitHub) is required in V1 — email + password is sufficient.

---

## 2. Dashboard — Default State

### What it shows on first login
- **Left panel**: Image slideshow (uses default images if user has no custom images).
- **Right panel**:
  - Navigation area showing **Daily Tasks** tab as the only tab.
  - An **"+ Add Section"** button placed immediately to the right of the "Daily Tasks" tab label.
  - Below the tabs: the **Daily Tasks** section (identical behaviour to the original app).
- **Bottom fixed bar**: Music player (uses default songs if user has no custom songs).

### Daily Tasks behaviour
Unchanged from the original:
- Users can add tasks, mark them complete, and see completed tasks in a collapsible section.
- Tasks are date-scoped: each new calendar day starts with an empty list.
- Data is stored per-user in the database (not in localStorage).

---

## 3. Adding Sections

### Entry point
The **"+ Add Section"** button sits next to the "Daily Tasks" tab header. It is always visible unless the user already has 3 sections, in which case it is greyed out with a tooltip: *"Maximum 3 sections reached."*

### Modal — three options

Clicking the button opens a modal with three choices:

#### Option A: Workout
- No further input needed.
- One click creates the section immediately.
- The new tab appears in the navigation bar.
- Dashboard is identical to the existing **GYM Updates** section: heatmap calendar + streak stat cards (Current Streak, Longest Streak, Total Workouts).
- Colour palette: `#FBA98E → #F86A3A → #F64409` (same as original).

#### Option B: Expenses
- No further input needed.
- One click creates the section immediately.
- Dashboard is identical to the existing **Expenses** section: heatmap calendar + spending stat cards (Daily Spending, Monthly Spending, Yearly Spending) + day-click popup to enter an amount.
- Colour palette: same as original.

#### Option C: Custom
A small form appears inside the modal with two mandatory fields:

| Field | Rules |
|---|---|
| **Section Name** | Required. Supports emojis (standard Unicode input). Example: `🚀 Side Project` or `📚 Reading Log`. |
| **Notes** | Required. A short description of what to track. Displayed as a label inside the section. |

- Both fields must be filled before the **Submit** button becomes active.
- On submit: the section is created and a new tab appears in the navigation bar.
- The custom section dashboard looks **identical to the GYM Updates heatmap** — same grid, same stat cards (Current Streak, Longest Streak, Total Days), same colours.
- The section's **name** (emoji + text) is used as the tab label and the dashboard heading.
- The section's **notes** are displayed below the heatmap as a read-only panel (like the "Notes" panel in Morning Routine).

### Section limit
- Maximum **3 sections** across all types (Workout, Expenses, Custom — in any combination).
- The limit is enforced at the database level; the API will reject a 4th insert regardless of what the frontend does.

---

## 4. Removing Sections

- Each section tab has a small **×** / remove icon (visible on hover or always visible, depending on design).
- Clicking it shows a confirmation prompt: *"Remove [Section Name]? All recorded data will be deleted."*
- On confirmation, the section and all its entries are permanently deleted.
- The **Daily Tasks** section cannot be removed — it has no remove icon.

---

## 5. Profile Page (`/profile`)

### Entry point
Clicking the user's avatar or name in the header navigates to `/profile`.

### What it shows

Two panels side by side:

#### Images Panel
- Shows all images currently uploaded by the user (thumbnail grid).
- Each thumbnail has a **Delete** button.
- An **Upload Image** button opens the native file picker filtered to `.jpg .jpeg .png .webp`.
- Limit: **10 images max**. If the user is at the limit, the upload button is disabled with text: *"Maximum 10 images reached. Delete one to add more."*

#### Songs Panel
- Shows all songs currently uploaded by the user (list with filename and duration).
- Each row has a **Delete** button.
- An **Upload Song** button opens the native file picker filtered to `.mp3 .m4a .ogg`.
- Limit: **5 songs max**. If the user is at the limit, the upload button is disabled with text: *"Maximum 5 songs reached. Delete one to add more."*

### Default media fallback
- If a user has **zero custom images**, the slideshow uses all 10 default images (HanumanJi1–10).
- If a user has **zero custom songs**, the music player uses all 3 default songs.
- The moment a user uploads even one image, only their images are shown (defaults are hidden).
- The moment a user uploads even one song, only their songs are played (defaults are hidden).
- If a user deletes all their images/songs, the app falls back to defaults automatically.

---

## 6. Music Player

- Fixed bottom bar, always visible across all pages.
- Behaviour is identical to the original app: play/pause, previous, next, loop.
- Song list is dynamically loaded from the user's media (or defaults if none).
- If the user uploads songs on the profile page, the player picks them up without a page reload.

---

## 7. Image Slideshow

- Left panel, always visible on the dashboard.
- Cycles through images every 15 seconds (same as original).
- Images are loaded from the user's media (or defaults if none).
- If the user manages media on the profile page, the slideshow reflects the new list on next page load (or immediately if a live subscription is used).

---

## 8. Heatmap Sections — Shared Behaviour

All three section types (Workout, Expenses, Custom) use the same heatmap component with the following shared behaviour:

| Behaviour | Detail |
|---|---|
| Grid layout | 52-week × 7-day grid, scrollable horizontally |
| Year navigation | Left/right arrows to view previous/next years |
| Colour scale | Empty → `#FBA98E` → `#F86A3A` → `#F64409` |
| Legend | "Less … More" label below the grid |
| Click to log | Click a cell to log/edit the value for that day |
| **Workout / Custom** | Click cycles the cell through levels 0 → 1 → 2 → 3 → 0 |
| **Expenses** | Click opens a popup with a numeric input (amount in ₹) |

---

## 9. Navigation Bar

- Tabs are rendered dynamically based on the user's sections.
- "Daily Tasks" is always the first (leftmost) tab and is non-removable.
- User sections appear to the right of Daily Tasks in the order they were created.
- The "+ Add Section" button appears after the last tab.
- The active tab is visually highlighted (same styling as the original app).

---

## 10. Colour Scheme — Preservation Guarantee

No colour values are changed from the original. The full palette is:

| Variable | Hex | Usage |
|---|---|---|
| `--c1` | `#FBA98E` | Heatmap level 1, light accents |
| `--c2` | `#F86A3A` | Heatmap level 2, medium accents |
| `--c3` | `#F64409` | Heatmap level 3, header underline, primary highlight |
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#FFF8F6` | Card and panel backgrounds |
| `--border` | `#F0E8E5` | Default borders |
| `--border-strong` | `#E8D5CF` | Strong borders |
| `--text` | `#1A0A06` | Primary text |
| `--text-muted` | `#8A6560` | Secondary / label text |
| `--empty` | `#F5EDE9` | Empty heatmap cells |

These are defined once in `tailwind.config.js` and referenced by all components. No component defines a colour directly — they always use a token. This makes future palette changes a one-line edit.
