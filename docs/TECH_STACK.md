# Tech Stack — MyUpdates V1

> **Project**: MyUpdates V1 — Multi-user, personalised dashboard with authentication, custom sections, and media management.
> **Date**: 2026-04-26
> **Derived from**: MyUpdates (vanilla HTML/CSS/JS + localStorage)

---

## Why the Existing Stack Cannot Scale to V1

The original MyUpdates runs entirely in the browser with `localStorage` as its data store. That works perfectly for a single-user personal app, but V1 introduces requirements that browser-only storage fundamentally cannot satisfy:

| Requirement | Why localStorage Fails |
|---|---|
| User login & accounts | `localStorage` is per-browser, per-device. There is no concept of identity. |
| Data shared across devices | A user logging in on a phone cannot see data saved on their laptop. |
| User-uploaded images (up to 10) | Binary files cannot live in `localStorage` (size limits, no real blob handling). |
| User-uploaded songs (up to 5) | Same problem — MP3 files need a proper object-storage bucket. |
| Per-user custom sections | With no identity, there is no way to know which sections belong to whom. |
| Section limit enforcement (≤ 3) | Must be enforced server-side; a browser check is trivially bypassed. |

V1 needs a **full-stack architecture**: a frontend, a database, authentication, and file storage.

---

## Recommended Tech Stack

### At a Glance

| Layer | Technology | Reason |
|---|---|---|
| Frontend + API | **Next.js 14 (App Router)** | Full-stack React framework; API routes and UI in one project |
| Styling | **Tailwind CSS** | Utility-first; trivially maps the existing CSS variables to a Tailwind theme |
| Database | **Supabase (PostgreSQL)** | Managed Postgres with a generous free tier, real-time, and Row-Level Security |
| Authentication | **Supabase Auth** | Built into Supabase; email/password + OAuth; no extra service needed |
| File Storage | **Supabase Storage** | S3-compatible buckets; same dashboard as the DB; handles images and audio |
| Hosting | **Vercel** | Zero-config Next.js deploys; free tier for personal projects |

---

## Why Each Choice Was Made

### 1. Next.js 14 (App Router)

**What it is:** A React framework that bundles the frontend and a lightweight Node.js backend (API Routes / Server Actions) into a single project and deployment unit.

**Why it fits V1:**

- **No separate backend project.** API routes live inside the same Next.js repo under `app/api/`. You write one codebase, deploy one thing.
- **File-based routing.** Adding a `/profile` page or `/dashboard` page is just creating a folder — no router configuration needed.
- **Server Components.** Data fetching happens on the server before the page is sent to the browser, so the dashboard loads fast without a visible loading spinner for initial data.
- **TypeScript built-in.** Catches bugs at write time, not at runtime.
- **The existing UI logic translates directly.** The heatmap calendar, task cards, stats, and music player are all portable to React components. The CSS variables from the original `style.css` become a Tailwind theme extension — no visual regressions.

**Why not Vue / Svelte / plain React + Express:**

- Vue/Nuxt and Svelte/SvelteKit are both fine frameworks, but the ecosystem around React (component libraries, auth adapters, Supabase SDKs) is larger and better documented for this exact use case.
- Plain React + a separate Express server means maintaining two repos, two deployments, and CORS configuration — unnecessary complexity for a solo or small-team project.

---

### 2. Tailwind CSS

**What it is:** A utility-first CSS framework where you compose styles directly in JSX/HTML using class names.

**Why it fits V1:**

- The existing color scheme (`--c1: #FBA98E`, `--c2: #F86A3A`, `--c3: #F64409`, etc.) maps 1:1 to a Tailwind `extend.colors` config block. No colour changes are needed.
- Rapid prototyping — no switching between a `.css` file and a component file.
- Tailwind's `@apply` directive can reproduce the exact existing CSS rules if needed.

**Colour scheme preservation strategy:**
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        light:  '#FBA98E',  // --c1
        mid:    '#F86A3A',  // --c2
        strong: '#F64409',  // --c3
      },
      surface: '#FFF8F6',
      border:  '#F0E8E5',
      'border-strong': '#E8D5CF',
      text:    '#1A0A06',
      muted:   '#8A6560',
      empty:   '#F5EDE9',
    }
  }
}
```
Every component in V1 uses these tokens — the app will look identical to the original.

---

### 3. Supabase (PostgreSQL)

**What it is:** An open-source Firebase alternative built on top of PostgreSQL. It provides a hosted database, a REST and GraphQL API auto-generated from your schema, real-time subscriptions, Row-Level Security (RLS), and a web dashboard.

**Why it fits V1:**

- **One platform for DB + Auth + Storage.** You do not need to stitch together separate services (e.g., PlanetScale + AWS Cognito + S3). Supabase does all three.
- **Row-Level Security.** You write a policy like `"users can only read rows where user_id = auth.uid()"` directly in the database. Even if the app code has a bug, the database rejects unauthorised reads and writes. This is the right way to enforce the section limit (≤ 3) and media limits (≤ 5 songs, ≤ 10 images).
- **Free tier is production-ready for personal projects.** 500 MB database, 1 GB file storage, 50,000 monthly active users — more than enough.
- **JavaScript SDK.** `@supabase/supabase-js` works natively in Next.js, including Server Components.

**Why not Firebase / MongoDB:**

- **Firebase (Firestore)** uses a document/collection model. Relational data like "a user has many sections, each section has many entries" is cleaner to model and query in SQL. Joins in Firestore require multiple round trips or denormalisation.
- **MongoDB Atlas** has similar concerns — and adding auth and file storage requires two more services (Auth0, S3).

---

### 4. Supabase Auth

**What it is:** The authentication layer built into Supabase. It supports email/password, magic links, and OAuth providers (Google, GitHub, Apple, etc.) out of the box.

**Why it fits V1:**

- Zero extra service to configure. It is already available the moment you create a Supabase project.
- Sessions are JWT-based and automatically forwarded to your Next.js API routes via the `@supabase/ssr` package.
- The `auth.uid()` function inside Supabase RLS policies ties every database row back to the logged-in user — no manual user ID management needed.
- Supports email/password sign-up and login, which is all V1 needs.

---

### 5. Supabase Storage

**What it is:** An S3-compatible object-storage service inside the Supabase platform. You create buckets, set access policies, and get public or signed URLs for files.

**Why it fits V1:**

- **Same dashboard as the database.** No separate AWS console or third-party CDN to configure.
- **Bucket-level and file-level RLS.** You can write policies like `"a user can only upload to a path that starts with their own user_id"` — this is how the 10-image / 5-song limit will be enforced at the storage level.
- **Public CDN URLs.** Uploaded files get a stable public URL that can be stored in the database and used directly in `<img>` and `<audio>` tags — no proxying through your server.
- **Default media fallback.** The original images (`HanumanJi1.jpg` → `HanumanJi10.png`) and songs (`Bhajan/`) are uploaded once into a shared `defaults/` bucket. When a user has no custom media, the app falls back to these default URLs — identical behaviour to the original app.

---

### 6. Vercel

**What it is:** A hosting platform made by the creators of Next.js. It deploys Next.js applications with zero configuration — connect your GitHub repo and every push to `main` is live in under a minute.

**Why it fits V1:**

- **Free hobby tier** covers personal and small-audience projects.
- **Edge Network.** Static assets and Server Components are served from the closest edge node globally.
- **Environment variables UI.** Supabase credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are set through the Vercel dashboard, not committed to the repo.

---

## Architecture Overview

```
Browser (Next.js React Client)
        │
        │  HTTP / Server Components
        ▼
Next.js App (Vercel Edge / Node.js)
  ├── app/
  │   ├── page.tsx               ← Landing / Login
  │   ├── dashboard/page.tsx     ← Main user dashboard
  │   ├── profile/page.tsx       ← Media management (images + songs)
  │   └── api/
  │       ├── sections/          ← CRUD for user sections
  │       └── media/             ← Upload / delete media
        │
        │  Supabase JS SDK
        ▼
Supabase Platform
  ├── Auth          ← Login, session, JWT
  ├── PostgreSQL    ← User data, sections, tasks, entries
  └── Storage       ← User images, user songs, default media
```

---

## Database Schema (Proposed)

### `profiles` — one row per user
```sql
id          uuid  PRIMARY KEY  REFERENCES auth.users(id)
created_at  timestamptz
```
Automatically created when a user signs up via a Supabase trigger.

### `sections` — the custom sections each user adds
```sql
id          uuid  PRIMARY KEY  DEFAULT gen_random_uuid()
user_id     uuid  NOT NULL     REFERENCES profiles(id)
type        text  NOT NULL     CHECK (type IN ('workout', 'expenses', 'custom'))
name        text  NOT NULL     -- emoji + text, e.g. "🚀 Side Project"
notes       text               -- what to track (mandatory for custom type)
position    int   NOT NULL     -- 1, 2, or 3; display order
created_at  timestamptz
```
**RLS policy:** `user_id = auth.uid()` on all operations.
**Section limit:** A database-level CHECK or trigger rejects insert when `COUNT(*) >= 3` for the user.

### `entries` — daily log entries for any section
```sql
id          uuid  PRIMARY KEY  DEFAULT gen_random_uuid()
section_id  uuid  NOT NULL     REFERENCES sections(id) ON DELETE CASCADE
user_id     uuid  NOT NULL     REFERENCES profiles(id)
entry_date  date  NOT NULL
level       int               -- for heatmap sections (0–3)
amount      numeric           -- for expenses sections
created_at  timestamptz
UNIQUE (section_id, entry_date)
```

### `tasks` — daily tasks (Daily Tasks section, always present)
```sql
id          uuid  PRIMARY KEY  DEFAULT gen_random_uuid()
user_id     uuid  NOT NULL     REFERENCES profiles(id)
text        text  NOT NULL
completed   boolean  DEFAULT false
task_date   date  NOT NULL     -- scoped to the day it was created
created_at  timestamptz
```

### `user_media` — references to user-uploaded images and songs
```sql
id            uuid  PRIMARY KEY  DEFAULT gen_random_uuid()
user_id       uuid  NOT NULL     REFERENCES profiles(id)
type          text  NOT NULL     CHECK (type IN ('image', 'song'))
storage_path  text  NOT NULL     -- path in Supabase Storage bucket
display_name  text              -- original filename shown in UI
created_at    timestamptz
```
**Limits enforced by RLS + trigger:** `COUNT(*) WHERE type = 'image' <= 10`, `COUNT(*) WHERE type = 'song' <= 5`.

---

## Media Management — Default Fallback Logic

The original 10 images and 3 songs are stored in Supabase Storage under a public `defaults/` bucket folder:
```
defaults/
  images/
    HanumanJi1.jpg … HanumanJi10.png
  songs/
    Ram-Naam-Jap.mp3
    Jai-Shree-Ram.mp3
    Sri-Ramadootha-Stotram.mp3
```

**At runtime**, the app applies this logic:
```
if user has 0 images in user_media  →  show all 10 default images
if user has ≥ 1 image in user_media  →  show only the user's images

if user has 0 songs in user_media   →  play all 3 default songs
if user has ≥ 1 song in user_media  →  play only the user's songs
```
This is identical behaviour to the original app for a user who has not yet uploaded anything.

---

## Section Types — Behaviour Mapping

| Type | UI | Data | Equivalent in V1 |
|---|---|---|---|
| **Workout** | Heatmap calendar + 3 stat cards (Current Streak, Longest Streak, Total Workouts) | `entries.level` (0–3) | Exact clone of GYM Updates section |
| **Expenses** | Heatmap calendar + 3 stat cards (Daily / Monthly / Yearly spending) + day-click popup | `entries.amount` | Exact clone of Expenses section |
| **Custom** | Heatmap calendar (same colours, same logic as GYM Updates) + 3 stat cards | `entries.level` (0–3) | Same heatmap with custom `name` and `notes` as labels |

**All three share:** the same heatmap grid component, the same colour palette (`#FBA98E → #F86A3A → #F64409`), and the same year-navigation controls.

---

## Feature Constraints Summary

| Feature | Constraint | Enforcement Location |
|---|---|---|
| Sections per user | Max 3 | Database trigger + API validation |
| Images per user | Max 10 | Database RLS + API validation |
| Songs per user | Max 5 | Database RLS + API validation |
| Default media | Used when user has none | Application logic (frontend + API) |
| Section names | Required, emoji supported | Frontend form validation (HTML required + Unicode input) |
| Notes (Custom section) | Required | Frontend form validation |

---

## User Flows

### Sign Up / Login
1. User visits the app root (`/`).
2. A login/register form is shown (email + password).
3. Supabase Auth creates the account and session.
4. App redirects to `/dashboard`.

### Dashboard (Default State)
- Daily Tasks section is always visible (cannot be removed).
- Sections the user has added appear as additional tabs.
- An **"+ Add Section"** button sits next to the Daily Tasks tab header.
- Clicking it opens a modal with three options: **Workout**, **Expenses**, **Custom**.

### Adding a Section
- **Workout / Expenses**: one click — section is created immediately and appended to the dashboard.
- **Custom**: a form appears with two mandatory fields: **Section Name** (emoji + text) and **Notes** (what to track). Submit creates the section.
- If the user already has 3 sections, the **"+ Add Section"** button is disabled and shows a tooltip: "You can have at most 3 sections."

### Profile Page (`/profile`)
- Accessible by clicking the user's avatar/name in the header.
- Two panels: **Images** (up to 10) and **Songs** (up to 5).
- Each panel shows currently uploaded files with a delete button.
- An upload button opens the native file picker (images: `.jpg .jpeg .png .webp`; songs: `.mp3 .m4a .ogg`).
- Uploading beyond the limit shows an inline error — no file is stored.

---

## Project Folder Structure (Proposed)

```
MyUpdatesV1/
├── app/
│   ├── layout.tsx               ← Root layout (header with profile avatar, music player)
│   ├── page.tsx                 ← Login / Register page
│   ├── dashboard/
│   │   └── page.tsx             ← Main dashboard (Daily Tasks + user sections)
│   └── profile/
│       └── page.tsx             ← Media management page
│
├── components/
│   ├── HeatmapCalendar.tsx      ← Shared heatmap grid (Workout / Expenses / Custom)
│   ├── StatCards.tsx            ← Shared stat cards row
│   ├── DailyTasks.tsx           ← Daily Tasks section
│   ├── MusicPlayer.tsx          ← Bottom fixed player bar
│   ├── Slideshow.tsx            ← Left-column image slideshow
│   ├── AddSectionModal.tsx      ← Modal with Workout / Expenses / Custom options
│   └── CustomSectionForm.tsx    ← Form for custom section name + notes
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts            ← Browser-side Supabase client
│   │   └── server.ts            ← Server-side Supabase client (for Server Components)
│   └── utils.ts                 ← Date helpers, level calculators, etc.
│
├── docs/
│   └── TECH_STACK.md            ← This document
│
├── public/
│   └── logo/
│       └── HanumanJiLogo.jpeg
│
├── tailwind.config.js           ← Colour scheme tokens
├── next.config.js
├── tsconfig.json
└── package.json
```

---

## Summary: Why This Stack Over Alternatives

| Alternative | Why Rejected |
|---|---|
| Keep vanilla HTML/JS | Cannot support multi-user login, cross-device data, or file uploads |
| React + Express + MongoDB | Three separate services to manage; no built-in RLS; extra CORS setup |
| Vue/Nuxt + Firebase | Firebase Firestore is document-based — relational data (user → sections → entries) requires awkward denormalisation; Auth and Storage are separate Firebase products |
| React + Clerk + PlanetScale + S3 | Four services instead of two (Next.js + Supabase); higher complexity and cost |
| Next.js + Firebase | Firebase Storage and Firestore work, but RLS and SQL joins are cleaner in Postgres for this data shape |

**Next.js + Supabase + Tailwind + Vercel** wins because:
1. It is **two services** (Next.js on Vercel, Supabase) instead of 3–4.
2. Auth, database, and file storage all live on **one platform** (Supabase).
3. The existing colour scheme transfers to Tailwind with **no visual changes**.
4. The existing JS logic (heatmap, stats, tasks, player) translates to React components with **minimal rewriting**.
5. **Free tier on both platforms** covers the full scope of this personal project.
