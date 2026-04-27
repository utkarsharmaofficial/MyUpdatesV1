# MyUpdates V1 — Documentation Index

> Multi-user personal dashboard with authentication, custom sections, and media management.
> **Stack**: Next.js 14 · Supabase · Tailwind CSS · Vercel

---

## Core Documents

| File | What It Covers |
|---|---|
| [TECH_STACK.md](./TECH_STACK.md) | Why each technology was chosen. Full database schema, storage strategy, alternatives rejected. |
| [FEATURE_SPEC.md](./FEATURE_SPEC.md) | Every user-facing feature in plain language: auth, sections, profile page, colour rules. |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Detailed system design: component tree, all data flows, API contracts, security model, complete folder structure. |

---

## Task Breakdown (Execute in Order)

| Task | File | What It Builds |
|---|---|---|
| Task 01 | [TASK_01_Project_Setup.md](./TASK_01_Project_Setup.md) | Next.js scaffold, Tailwind colour tokens, folder structure, env template |
| Task 02 | [TASK_02_Database_Schema.md](./TASK_02_Database_Schema.md) | Supabase tables, RLS policies, limit triggers, auto-profile trigger |
| Task 03 | [TASK_03_Storage_Setup.md](./TASK_03_Storage_Setup.md) | Storage buckets, policies, default images + songs uploaded, `lib/defaults.ts` |
| Task 04 | [TASK_04_Supabase_Client_Integration.md](./TASK_04_Supabase_Client_Integration.md) | Browser client, server client, middleware (session refresh + route protection) |
| Task 05 | [TASK_05_Authentication_Pages.md](./TASK_05_Authentication_Pages.md) | Login/register page, signOut action, auth redirects |
| Task 06 | [TASK_06_Root_Layout_Global_Shell.md](./TASK_06_Root_Layout_Global_Shell.md) | Header, two-column layout, Slideshow placeholder, MusicPlayer placeholder |
| Task 07 | [TASK_07_Utility_Functions.md](./TASK_07_Utility_Functions.md) | Date helpers, streak calculators, expense calculators, media resolver, grid builder |
| Task 08 | [TASK_08_Shared_UI_Components.md](./TASK_08_Shared_UI_Components.md) | HeatmapCalendar, StatCards, ExpensePopup, NotesPanel |
| Task 09 | [TASK_09_Daily_Tasks_Section.md](./TASK_09_Daily_Tasks_Section.md) | DailyTasks component — add, complete, date-scoped |
| Task 10 | [TASK_10_Workout_Section.md](./TASK_10_Workout_Section.md) | WorkoutSection — heatmap + streak stats |
| Task 11 | [TASK_11_Expenses_Section.md](./TASK_11_Expenses_Section.md) | ExpensesSection — heatmap + ₹ popup + spending stats |
| Task 12 | [TASK_12_Custom_Section.md](./TASK_12_Custom_Section.md) | CustomSection — user-defined name + notes + heatmap |
| Task 13 | [TASK_13_Slideshow_And_MusicPlayer.md](./TASK_13_Slideshow_And_MusicPlayer.md) | Full slideshow cycling + full audio player + media wired to layout |
| Task 14 | [TASK_14_Dashboard_Page_And_Navigation.md](./TASK_14_Dashboard_Page_And_Navigation.md) | Dashboard page, dynamic nav tabs, SectionBody renderer |
| Task 15 | [TASK_15_Add_Section_Modal.md](./TASK_15_Add_Section_Modal.md) | Add Section modal with Workout / Expenses / Custom flows |
| Task 16 | [TASK_16_Remove_Section.md](./TASK_16_Remove_Section.md) | Remove section — × button, confirmation, cascade delete |
| Task 17 | [TASK_17_Profile_Page.md](./TASK_17_Profile_Page.md) | Profile page — upload/delete images (≤10) and songs (≤5) |

---

## Final Verification

| File | What It Contains |
|---|---|
| [FINAL_VERIFICATION.md](./FINAL_VERIFICATION.md) | Complete checklist (19 sections, ~80 items) to verify every task executed correctly before shipping |

---

## Quick Facts

- **17 tasks** — each independent within its scope, ordered so each has what it needs from previous tasks.
- **Colour scheme unchanged** — all original hex values preserved and mapped to Tailwind tokens.
- **No code until Task 01** — all documentation only. Implementation begins at Task 01.
- **Free tier** — Supabase free tier (500 MB DB, 1 GB Storage, 50k MAU) + Vercel hobby tier cover this entire project.
