# Architecture — MyUpdates V1

> Detailed system-level design: every layer, every component, every data flow.
> **Date**: 2026-04-26
> **Stack**: Next.js 14 (App Router) · Supabase (PostgreSQL + Auth + Storage) · Tailwind CSS · Vercel

---

## 1. System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              User's Browser                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Header: Logo | "My Updates" | Profile Avatar → /profile | Logout      │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────────────────────┐  │
│  │  Left Panel (26%)   │  │  Right Panel (74%)                           │  │
│  │                     │  │                                              │  │
│  │  ┌───────────────┐  │  │  ┌──────────────────────────────────────┐   │  │
│  │  │   Slideshow   │  │  │  │  Nav Tabs                            │   │  │
│  │  │   (images)    │  │  │  │  [✅ Daily Tasks] [Tab2] [+ Add]     │   │  │
│  │  │               │  │  │  └──────────────────────────────────────┘   │  │
│  │  │  cycles 15s   │  │  │                                              │  │
│  │  │               │  │  │  ┌──────────────────────────────────────┐   │  │
│  │  └───────────────┘  │  │  │  Active Section Body                 │   │  │
│  │                     │  │  │  (DailyTasks / Workout / Expenses /  │   │  │
│  └─────────────────────┘  │  │   Custom)                            │   │  │
│                            │  └──────────────────────────────────────┘   │  │
│                            └──────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Music Player (fixed bottom): 🎵 | Song name | Progress | Controls     │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
                                     │
                         ┌───────────▼───────────┐
                         │   Next.js 14 on Vercel │
                         │                        │
                         │  app/                  │
                         │  ├── layout.tsx         │
                         │  ├── page.tsx (login)   │
                         │  ├── dashboard/         │
                         │  ├── profile/           │
                         │  └── api/               │
                         │      ├── sections/      │
                         │      ├── entries/       │
                         │      ├── tasks/         │
                         │      └── media/         │
                         └───────────┬────────────┘
                                     │  @supabase/supabase-js
                         ┌───────────▼────────────┐
                         │      Supabase Platform  │
                         │                        │
                         │  ┌──────┐ ┌────────┐  │
                         │  │ Auth │ │  DB    │  │
                         │  │ JWT  │ │ (PG)   │  │
                         │  └──────┘ └────────┘  │
                         │       ┌──────────┐    │
                         │       │ Storage  │    │
                         │       │ Buckets  │    │
                         │       └──────────┘    │
                         └────────────────────────┘
```

---

## 2. Page & Route Map

| Route | Type | Who Can Access | What It Renders |
|---|---|---|---|
| `/` | Client Component | Everyone | Login / Register form. Authenticated users are redirected to `/dashboard`. |
| `/dashboard` | Server Component (shell) + Client Components | Authenticated only | Two-column layout: Slideshow + Nav tabs + Active section + Music player. |
| `/profile` | Server Component (shell) + Client Components | Authenticated only | Images panel + Songs panel for media management. |
| `/api/sections` | API Route | Authenticated only (via JWT) | GET list, POST create, DELETE by id. |
| `/api/entries` | API Route | Authenticated only | GET by section+year, POST/PUT upsert entry. |
| `/api/tasks` | API Route | Authenticated only | GET today's tasks, POST create, PATCH toggle complete, DELETE by id. |
| `/api/media` | API Route | Authenticated only | GET list by type, DELETE by id (also deletes from Storage). |

---

## 3. Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Middleware (middleware.ts)              │
│                                                             │
│  Every request →  refresh Supabase session cookie           │
│  If path is /dashboard or /profile AND no session → /       │
│  If path is / AND session exists → /dashboard               │
└─────────────────────────────────────────────────────────────┘

Sign Up:
  User fills email + password → supabase.auth.signUp()
    → Supabase creates auth.users row
    → DB trigger creates profiles row (same uuid)
    → Middleware cookie written
    → Redirect → /dashboard

Sign In:
  User fills email + password → supabase.auth.signInWithPassword()
    → Supabase validates, returns JWT
    → Middleware cookie written
    → Redirect → /dashboard

Sign Out:
  User clicks logout → supabase.auth.signOut()
    → Cookie cleared
    → Redirect → /

Session on every request:
  middleware.ts calls supabase.auth.getUser()
  If token expired → supabase.auth.refreshSession() (silent)
  Updated cookie written back to response
```

---

## 4. Database Schema — Complete

### Table: `profiles`
```sql
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

-- Auto-create on sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Table: `sections`
```sql
CREATE TABLE sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('workout', 'expenses', 'custom')),
  name        text NOT NULL,               -- emoji + text, e.g. "🏋️ My Gym"
  notes       text,                        -- mandatory only for type='custom'
  position    int  NOT NULL DEFAULT 1,     -- display order 1–3
  created_at  timestamptz DEFAULT now()
);
```

### Table: `entries`
```sql
CREATE TABLE entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date  date NOT NULL,
  level       int  CHECK (level BETWEEN 0 AND 3),   -- workout / custom
  amount      numeric CHECK (amount >= 0),           -- expenses only
  created_at  timestamptz DEFAULT now(),
  UNIQUE (section_id, entry_date)
);
```

### Table: `tasks`
```sql
CREATE TABLE tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text        text NOT NULL,
  completed   boolean NOT NULL DEFAULT false,
  task_date   date NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz DEFAULT now()
);
```

### Table: `user_media`
```sql
CREATE TABLE user_media (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('image', 'song')),
  storage_path  text NOT NULL,    -- full path in Supabase Storage
  public_url    text NOT NULL,    -- CDN URL used in <img> and <audio> tags
  display_name  text NOT NULL,    -- original filename shown in UI
  created_at    timestamptz DEFAULT now()
);
```

---

## 5. Row-Level Security Policies

RLS is enabled on all five tables. All policies follow the same pattern: `user_id = auth.uid()`.

```sql
-- profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON profiles FOR ALL USING (id = auth.uid());

-- sections
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sections" ON sections FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- entries
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own entries" ON entries FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tasks" ON tasks FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- user_media
ALTER TABLE user_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own media" ON user_media FOR ALL
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
```

---

## 6. Database Triggers — Limit Enforcement

### Section limit: max 3 per user
```sql
CREATE OR REPLACE FUNCTION check_section_limit()
RETURNS trigger AS $$
BEGIN
  IF (SELECT COUNT(*) FROM sections WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Section limit reached (max 3)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_section_limit
  BEFORE INSERT ON sections
  FOR EACH ROW EXECUTE FUNCTION check_section_limit();
```

### Image limit: max 10 per user
```sql
CREATE OR REPLACE FUNCTION check_image_limit()
RETURNS trigger AS $$
BEGIN
  IF NEW.type = 'image' AND
     (SELECT COUNT(*) FROM user_media WHERE user_id = NEW.user_id AND type = 'image') >= 10 THEN
    RAISE EXCEPTION 'Image limit reached (max 10)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_image_limit
  BEFORE INSERT ON user_media
  FOR EACH ROW EXECUTE FUNCTION check_image_limit();
```

### Song limit: max 5 per user
```sql
CREATE OR REPLACE FUNCTION check_song_limit()
RETURNS trigger AS $$
BEGIN
  IF NEW.type = 'song' AND
     (SELECT COUNT(*) FROM user_media WHERE user_id = NEW.user_id AND type = 'song') >= 5 THEN
    RAISE EXCEPTION 'Song limit reached (max 5)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_song_limit
  BEFORE INSERT ON user_media
  FOR EACH ROW EXECUTE FUNCTION check_song_limit();
```

---

## 7. Supabase Storage — Bucket Design

### Bucket: `defaults` (public, read-only for all)
```
defaults/
  images/
    HanumanJi1.jpg
    HanumanJi2.jpg
    HanumanJi3.png
    HanumanJi4.jpg
    HanumanJi5.jpg
    HanumanJi6.jpg
    HanumanJi7.png
    HanumanJi8.jpg
    HanumanJi9.jpg
    HanumanJi10.png
  songs/
    Ram-Naam-Jap.mp3
    Jai-Shree-Ram.mp3
    Sri-Ramadootha-Stotram.mp3
```
Policy: Public read for all. No write for any authenticated user. Only writable via service role key (seeding script).

### Bucket: `user-media` (private, per-user folders)
```
user-media/
  {user_uuid}/
    images/
      uploaded-photo.jpg
    songs/
      uploaded-track.mp3
```
Storage RLS policy:
```sql
-- Users can only access their own folder (first path segment = their UUID)
CREATE POLICY "user owns their media folder"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'user-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 8. Component Tree

```
app/layout.tsx  (Server Component shell)
├── <Header />                    (Client) — logo, title, profile link, logout
├── <SlideshowWrapper />          (Client) — fetches user images, renders Slideshow
│   └── <Slideshow imageUrls />   (Client) — cycles images every 15s, dot indicators
├── {children}                    — page content slot
└── <MusicPlayerWrapper />        (Client) — fetches user songs, renders MusicPlayer
    └── <MusicPlayer songs />     (Client) — play/pause/prev/next/loop

app/page.tsx  (Client Component)
└── <AuthForm />                  (Client) — email+password, toggle sign-in/sign-up

app/dashboard/page.tsx  (Server Component)
└── <Dashboard sections tasks />  (Client) — receives pre-fetched data
    ├── <NavBar />                 (Client) — dynamic tabs, + Add Section button
    │   └── <AddSectionModal />    (Client) — Workout/Expenses/Custom options
    │       └── <CustomSectionForm /> — name + notes fields, submit
    └── <SectionBody />            (Client) — renders correct section
        ├── <DailyTasks />         (Client)
        ├── <WorkoutSection />     (Client)
        │   ├── <StatCards />
        │   └── <HeatmapCalendar type="workout" />
        ├── <ExpensesSection />    (Client)
        │   ├── <StatCards />
        │   ├── <HeatmapCalendar type="expenses" />
        │   └── <ExpensePopup />   (Client, conditional)
        └── <CustomSection />      (Client)
            ├── <StatCards />
            ├── <HeatmapCalendar type="custom" />
            └── <NotesPanel />

app/profile/page.tsx  (Server Component)
└── <ProfilePage userMedia />      (Client)
    ├── <MediaPanel type="image" /> (Client)
    │   ├── <ImageGrid />           — thumbnails with delete buttons
    │   └── <UploadButton />        — file picker, limit check
    └── <MediaPanel type="song" />  (Client)
        ├── <SongList />            — rows with filename + delete button
        └── <UploadButton />        — file picker, limit check
```

---

## 9. Shared Component Contracts

### `<HeatmapCalendar />`
```typescript
interface HeatmapCalendarProps {
  sectionId: string
  type: 'workout' | 'expenses' | 'custom'
  onEntryChange?: () => void  // callback to recompute stats after a write
}
```
Internally:
- Fetches `entries` for the selected year from Supabase (filtered by `section_id`).
- Maintains `year` state; prev/next arrows update it and re-fetch.
- Renders 52 columns × 7 rows. Each cell is a `<div>` coloured by level.
- For `workout`/`custom`: click cycles `level` → upserts entry → updates cell colour.
- For `expenses`: click opens `<ExpensePopup />` → on save upserts entry → updates cell colour.
- Colour mapping:

| level | hex |
|---|---|
| 0 (empty) | `#F5EDE9` (--empty) |
| 1 | `#FBA98E` (--c1) |
| 2 | `#F86A3A` (--c2) |
| 3 | `#F64409` (--c3) |

### `<StatCards />`
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

### `<ExpensePopup />`
```typescript
interface ExpensePopupProps {
  date: string         // YYYY-MM-DD
  currentAmount: number
  onSave: (amount: number) => void
  onClose: () => void
}
```

### `<Slideshow />`
```typescript
interface SlideshowProps {
  imageUrls: string[]  // resolved: user images or defaults
}
```
Cycles every 15 seconds. Dot indicators at bottom.

### `<MusicPlayer />`
```typescript
interface Song {
  name: string
  url: string     // public CDN URL (Supabase Storage)
}
interface MusicPlayerProps {
  songs: Song[]   // resolved: user songs or defaults
}
```

---

## 10. State Management Strategy

No global state library (Redux, Zustand, etc.) is needed. State is managed at three levels:

| Level | Mechanism | What Lives Here |
|---|---|---|
| **Server** | Supabase PostgreSQL | All persistent data (tasks, entries, sections, media) |
| **Page** | React `useState` / `useReducer` in page-level Client Components | Active tab, section list (updated after add/remove), media list (updated after upload/delete) |
| **Component** | React `useState` inside each component | Heatmap year, popup open/close, entry map for current year |

Data flows **down** via props. Events flow **up** via callback props (`onEntryChange`, `onSectionAdded`, etc.). No component reads from another component's state directly.

---

## 11. Data Flow — Every User Action

### A. Dashboard loads
```
Server:  GET /dashboard
         → supabase.auth.getUser()                 (verify session)
         → supabase.from('sections').select()       (user's sections)
         → supabase.from('tasks')
              .select().eq('task_date', today)       (today's tasks)
         → Render HTML with data embedded
Client:  Hydrate. No loading spinner for initial data.
```

### B. Add task
```
Client: User types text → clicks Add
        → supabase.from('tasks').insert({ user_id, text, task_date: today })
        → Supabase RLS: user_id = auth.uid() ✓
        → New row returned
        → React state: prepend new task to active list
```

### C. Mark task complete
```
Client: User clicks "Mark Complete"
        → supabase.from('tasks').update({ completed: true }).eq('id', taskId)
        → Supabase RLS: user_id = auth.uid() ✓
        → React state: move task from active list to completed list
```

### D. Click heatmap cell (Workout / Custom)
```
Client: User clicks cell for date D
        → Compute next level: (currentLevel + 1) % 4
        → supabase.from('entries').upsert({ section_id, user_id, entry_date: D, level: nextLevel })
        → Supabase RLS: user_id = auth.uid() ✓
        → React state: update cell colour immediately (optimistic)
        → onEntryChange() callback → recompute streak stats
```

### E. Click heatmap cell (Expenses) → save amount
```
Client: User clicks cell for date D
        → Open <ExpensePopup date=D currentAmount=stored />
        User types amount → clicks Save
        → Compute level from amount (thresholds: 0 / 1–500 / 501–1500 / 1501+)
        → supabase.from('entries').upsert({ section_id, user_id, entry_date: D, amount, level })
        → React state: update cell colour, close popup
        → onEntryChange() callback → recompute spending stats
```

### F. Add Section (Workout or Expenses)
```
Client: User clicks "+ Add Section" → modal opens → clicks Workout or Expenses card
        → supabase.from('sections').insert({ user_id, type: 'workout', name: '🏋️ Workout', position })
        → DB trigger: count check ≤ 3 ✓
        → React state: append new section to tabs list, close modal, switch to new tab
```

### G. Add Section (Custom)
```
Client: User clicks "+ Add Section" → modal opens → clicks Custom card
        → CustomSectionForm appears
        → User fills name (emoji + text) and notes
        → Clicks Submit (both fields required)
        → supabase.from('sections').insert({ user_id, type: 'custom', name, notes, position })
        → DB trigger: count check ≤ 3 ✓
        → React state: append new section to tabs, close modal, switch to new tab
```

### H. Remove Section
```
Client: User hovers tab → × button appears → clicks ×
        → Confirmation dialog: "Remove [name]? All data will be deleted."
        → User confirms
        → supabase.from('sections').delete().eq('id', sectionId)
        → DB: CASCADE deletes all entries for this section
        → React state: remove tab from list, switch active tab to Daily Tasks
```

### I. Upload image on Profile page
```
Client: User clicks Upload Image → file picker opens (accept .jpg .jpeg .png .webp)
        → Validate: count < 10 (frontend check)
        → Validate: file size ≤ 5 MB (frontend check)
        → path = `{user_id}/images/{uuid}.{ext}`
        → supabase.storage.from('user-media').upload(path, file)
        → Storage RLS: path[0] = auth.uid() ✓
        → Get public URL: supabase.storage.from('user-media').getPublicUrl(path)
        → supabase.from('user_media').insert({ user_id, type: 'image', storage_path: path, public_url, display_name })
        → DB trigger: image count check ≤ 10 ✓
        → React state: add new thumbnail to image grid
```

### J. Delete image on Profile page
```
Client: User clicks Delete on thumbnail → (no confirmation needed, or optional)
        → supabase.storage.from('user-media').remove([storagePath])
        → supabase.from('user_media').delete().eq('id', mediaId)
        → React state: remove thumbnail from grid
        → If count drops to 0: slideshow will use defaults on next dashboard load
```

### K. Default media fallback (applied on every layout load)
```
Server: layout.tsx fetches user media
        → supabase.from('user_media').select().eq('user_id', uid).eq('type', 'image')
        → count = 0?
            YES → imageUrls = DEFAULT_IMAGE_URLS  (10 hardcoded public Supabase Storage URLs)
            NO  → imageUrls = rows.map(r => r.public_url)
        → Same logic for songs
        → Pass imageUrls to <Slideshow />, songs to <MusicPlayer />
```

---

## 12. API Route Contracts

All API routes require a valid Supabase session cookie. They use the server-side Supabase client which reads the cookie and validates the JWT.

### `GET /api/sections`
- Response: `{ sections: Section[] }`
- Returns all sections for the authenticated user, ordered by `position`.

### `POST /api/sections`
- Body: `{ type: 'workout' | 'expenses' | 'custom', name: string, notes?: string }`
- Response: `{ section: Section }` or `{ error: 'Section limit reached' }` (HTTP 400)
- Inserts into `sections`. DB trigger enforces the ≤ 3 limit.

### `DELETE /api/sections/[id]`
- Response: `{ ok: true }` or `{ error: string }` (HTTP 403 if not owner)
- Deletes the section and all its entries (CASCADE).

### `GET /api/entries?sectionId=X&year=2026`
- Response: `{ entries: Entry[] }`
- Returns all entries for the given section and year.

### `POST /api/entries`
- Body: `{ sectionId: string, entryDate: string, level?: number, amount?: number }`
- Response: `{ entry: Entry }`
- Upserts (insert or update) the entry for the given section + date.

### `GET /api/tasks?date=YYYY-MM-DD`
- Response: `{ tasks: Task[] }`
- Returns all tasks for the authenticated user on the given date.

### `POST /api/tasks`
- Body: `{ text: string }`
- Response: `{ task: Task }`
- Creates a new task for today.

### `PATCH /api/tasks/[id]`
- Body: `{ completed: boolean }`
- Response: `{ task: Task }`
- Toggles the completed state of a task.

### `DELETE /api/tasks/[id]`
- Response: `{ ok: true }`

### `GET /api/media?type=image|song`
- Response: `{ media: UserMedia[] }`
- Returns all media of the given type for the authenticated user.

### `DELETE /api/media/[id]`
- Deletes from Supabase Storage AND the `user_media` table.
- Response: `{ ok: true }` or `{ error: string }`

---

## 13. Folder Structure — Complete

```
MyUpdatesV1/
│
├── app/
│   ├── layout.tsx                 ← Root layout: header, slideshow, music player, auth guard
│   ├── globals.css                ← Base Tailwind directives + any custom overrides
│   ├── page.tsx                   ← Login / Register page (unauthenticated root)
│   │
│   ├── dashboard/
│   │   └── page.tsx               ← Dashboard shell (Server Component, fetches sections+tasks)
│   │
│   ├── profile/
│   │   └── page.tsx               ← Profile/media management page (Server Component)
│   │
│   └── api/
│       ├── sections/
│       │   ├── route.ts           ← GET, POST /api/sections
│       │   └── [id]/
│       │       └── route.ts       ← DELETE /api/sections/[id]
│       ├── entries/
│       │   └── route.ts           ← GET, POST /api/entries
│       ├── tasks/
│       │   ├── route.ts           ← GET, POST /api/tasks
│       │   └── [id]/
│       │       └── route.ts       ← PATCH, DELETE /api/tasks/[id]
│       └── media/
│           ├── route.ts           ← GET /api/media
│           └── [id]/
│               └── route.ts       ← DELETE /api/media/[id]
│
├── components/
│   ├── auth/
│   │   └── AuthForm.tsx           ← Login/Register form (email + password, toggle)
│   │
│   ├── layout/
│   │   ├── Header.tsx             ← Logo, title, profile link, logout button
│   │   ├── Slideshow.tsx          ← Left-panel image slideshow (15s cycle, dot indicators)
│   │   └── MusicPlayer.tsx        ← Fixed bottom bar: controls, progress, song name
│   │
│   ├── dashboard/
│   │   ├── Dashboard.tsx          ← Client component: tab state, section list
│   │   ├── NavBar.tsx             ← Dynamic tabs, + Add Section button
│   │   ├── SectionBody.tsx        ← Renders correct section based on active tab
│   │   ├── AddSectionModal.tsx    ← Modal: Workout / Expenses / Custom option cards
│   │   └── CustomSectionForm.tsx  ← Form: Section Name + Notes (both required)
│   │
│   ├── sections/
│   │   ├── DailyTasks.tsx         ← Date-scoped task manager
│   │   ├── WorkoutSection.tsx     ← HeatmapCalendar + StatCards (streak stats)
│   │   ├── ExpensesSection.tsx    ← HeatmapCalendar + StatCards + ExpensePopup
│   │   └── CustomSection.tsx      ← HeatmapCalendar + StatCards + NotesPanel
│   │
│   └── shared/
│       ├── HeatmapCalendar.tsx    ← 52×7 heatmap grid, year nav, click to log
│       ├── StatCards.tsx          ← Row of 3 stat cards with emoji, value, label
│       ├── ExpensePopup.tsx       ← Day-click popup: ₹ amount input, Save/Cancel
│       └── NotesPanel.tsx         ← Read-only notes display below heatmap
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts              ← Browser Supabase client (singleton)
│   │   └── server.ts              ← Server Supabase client (reads cookies)
│   ├── utils.ts                   ← Date helpers, streak calc, level calc, media resolver
│   └── defaults.ts                ← Hardcoded public URLs for default images + songs
│
├── middleware.ts                   ← Session refresh + route protection
│
├── public/
│   └── logo/
│       └── HanumanJiLogo.jpeg
│
├── docs/
│   ├── README.md
│   ├── ARCHITECTURE.md            ← This file
│   ├── TECH_STACK.md
│   ├── FEATURE_SPEC.md
│   ├── TASK_01_Project_Setup.md
│   ├── TASK_02_Database_Schema.md
│   ├── TASK_03_Storage_Setup.md
│   ├── TASK_04_Supabase_Client_Integration.md
│   ├── TASK_05_Authentication_Pages.md
│   ├── TASK_06_Root_Layout_Global_Shell.md
│   ├── TASK_07_Utility_Functions.md
│   ├── TASK_08_Shared_UI_Components.md
│   ├── TASK_09_Daily_Tasks_Section.md
│   ├── TASK_10_Workout_Section.md
│   ├── TASK_11_Expenses_Section.md
│   ├── TASK_12_Custom_Section.md
│   ├── TASK_13_Slideshow_And_MusicPlayer.md
│   ├── TASK_14_Dashboard_Page_And_Navigation.md
│   ├── TASK_15_Add_Section_Modal.md
│   ├── TASK_16_Remove_Section.md
│   ├── TASK_17_Profile_Page.md
│   └── FINAL_VERIFICATION.md
│
├── tailwind.config.js             ← Colour token definitions
├── next.config.js
├── middleware.ts
├── tsconfig.json
├── .env.local.example
└── package.json
```

---

## 14. Colour Scheme — Token Reference

All colours are defined once in `tailwind.config.js` and never hardcoded in components.

| Token | Hex | Tailwind Class Example | Original CSS Variable |
|---|---|---|---|
| `brand-light` | `#FBA98E` | `bg-brand-light` | `--c1` |
| `brand-mid` | `#F86A3A` | `bg-brand-mid` | `--c2` |
| `brand-strong` | `#F64409` | `bg-brand-strong` | `--c3` |
| `surface` | `#FFF8F6` | `bg-surface` | `--surface` |
| `border` | `#F0E8E5` | `border-border` | `--border` |
| `border-strong` | `#E8D5CF` | `border-border-strong` | `--border-strong` |
| `app-text` | `#1A0A06` | `text-app-text` | `--text` |
| `app-muted` | `#8A6560` | `text-app-muted` | `--text-muted` |
| `empty` | `#F5EDE9` | `bg-empty` | `--empty` |

Heatmap cell colour selection logic:
```typescript
function cellColour(level: 0 | 1 | 2 | 3): string {
  return ['#F5EDE9', '#FBA98E', '#F86A3A', '#F64409'][level]
}
```

---

## 15. Security Summary

| Threat | Mitigation |
|---|---|
| Unauthenticated access to `/dashboard` | Next.js middleware redirects to `/` |
| User A reading User B's data | Supabase RLS: every query scoped to `auth.uid()` |
| User uploading to another user's storage folder | Storage RLS: path must start with `auth.uid()` |
| Bypassing the 3-section limit via API | PostgreSQL trigger rejects the 4th insert at DB level |
| Bypassing the 10-image / 5-song limit via API | PostgreSQL trigger rejects over-limit inserts at DB level |
| Accessing the service role key from the browser | `SUPABASE_SERVICE_ROLE_KEY` is never in `NEXT_PUBLIC_*` variables |
| Secrets in source control | `.env.local` is in `.gitignore`; Vercel dashboard holds production secrets |

---

## 16. Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + Server | Public anon key (safe; RLS enforces access) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin key for seeding default media; never exposed to browser |
