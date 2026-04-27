# Final Verification Checklist — MyUpdates V1

> Run this checklist top to bottom after all 17 tasks are complete. Every item must pass before the application is considered production-ready.
> **Date**: 2026-04-26

---

## How to Use This Checklist

Work through each section in order. A failing check means something is broken — fix it before continuing. Do not skip sections or assume something works without testing it.

For each item: test it manually in the browser, then mark it `[x]`.

---

## Section 1 — Project Setup (Task 01)

- [ ] `npm run dev` starts with zero errors.
- [ ] `npm run build` completes with zero TypeScript errors and zero ESLint errors.
- [ ] `localhost:3000` loads in the browser.
- [ ] `tailwind.config.ts` contains all 9 brand colour tokens (`brand-light`, `brand-mid`, `brand-strong`, `surface`, `border`, `border-strong`, `app-text`, `app-muted`, `empty`).
- [ ] `.env.local` is present and NOT committed to git (check `git status`).
- [ ] `public/logo/HanumanJiLogo.jpeg` exists.

---

## Section 2 — Database (Task 02)

- [ ] Supabase dashboard shows 5 tables: `profiles`, `sections`, `entries`, `tasks`, `user_media`.
- [ ] Each table has the **RLS enabled** badge in the Table Editor.
- [ ] Each table has at least one policy in **Authentication → Policies**.
- [ ] Run in Supabase SQL Editor — should succeed:
  ```sql
  SELECT id FROM profiles LIMIT 1;
  ```
- [ ] Run in Supabase SQL Editor — should raise an exception when testing section limit (fill in a real user UUID):
  ```sql
  -- Insert 3 sections first, then run this — should fail:
  INSERT INTO sections (user_id, type, name) VALUES ('<uuid>', 'workout', 'Test');
  ```
- [ ] Triggers visible in Supabase: `enforce_section_limit`, `enforce_image_limit`, `enforce_song_limit`, `on_auth_user_created`.

---

## Section 3 — Storage (Task 03)

- [ ] `defaults` bucket visible in Supabase Storage.
- [ ] All 10 default images loadable in browser (open a public URL directly — no auth required).
- [ ] All 3 default songs loadable in browser.
- [ ] `user-media` bucket visible with a private (non-public) badge.
- [ ] `lib/defaults.ts` has 10 image entries and 3 song entries with real Supabase URLs (not placeholder text).
- [ ] Attempting to access a `user-media` URL without auth returns 400 or 403.

---

## Section 4 — Authentication (Tasks 04, 05)

- [ ] Visiting `localhost:3000/dashboard` without logging in redirects to `localhost:3000/`.
- [ ] Visiting `localhost:3000/profile` without logging in redirects to `localhost:3000/`.
- [ ] `/` shows a login/register form with email + password fields.
- [ ] Can register a new account. New user appears in Supabase **Authentication → Users**.
- [ ] New user's `profiles` row is created automatically (check `profiles` table in Supabase).
- [ ] Logging in with correct credentials redirects to `/dashboard`.
- [ ] Logging in with wrong password shows an inline error message (not a page crash).
- [ ] Visiting `/` while logged in redirects to `/dashboard`.
- [ ] Clicking the logout button in the header clears the session and redirects to `/`.
- [ ] After logout, visiting `/dashboard` redirects to `/`.
- [ ] Two separate accounts have fully isolated data (verify by logging in with Account A, adding data, then logging in with Account B — Account B's dashboard is empty).

---

## Section 5 — Layout & Shell (Task 06)

- [ ] Sticky header is visible on every page (`/`, `/dashboard`, `/profile`).
- [ ] Header shows the HanumanJi logo (36×36 px, rounded corners).
- [ ] Header title reads "My **Updates**" with "Updates" in `#F64409`.
- [ ] Header has a profile avatar/link that navigates to `/profile`.
- [ ] Header has a logout button that works.
- [ ] `/dashboard` shows the two-column layout: left panel (~26%) + right column (~74%).
- [ ] Left panel has a distinct border on the right.
- [ ] Fixed music player bar is visible at the bottom of every page.
- [ ] Background colour is `#FFFFFF`. Surface cards are `#FFF8F6`. Primary text is `#1A0A06`.

---

## Section 6 — Utility Functions (Task 07)

Open the browser DevTools console and run these tests (or write a simple test file):

- [ ] `toKey(new Date('2026-04-26'))` → `'2026-04-26'`
- [ ] `getCurrentStreak({})` → `0`
- [ ] `getLongestStreak({})` → `0`
- [ ] `getTotalCount({ '2026-04-01': 1, '2026-04-02': 0 })` → `1`
- [ ] `getLevelFromAmount(0)` → `0`
- [ ] `getLevelFromAmount(250)` → `1`
- [ ] `getLevelFromAmount(1000)` → `2`
- [ ] `getLevelFromAmount(2000)` → `3`
- [ ] `resolveImages([])` returns an array of 10 items (default images).
- [ ] `resolveImages([{ type: 'image', public_url: 'x', display_name: 'y', id: '1' }])` returns a 1-item array.
- [ ] `buildYearGrid(2026)` returns an array of weeks where the first date is a Sunday.

---

## Section 7 — Shared Components (Task 08)

- [ ] `<StatCards>` renders three cards side by side with emoji, bold value, and muted label.
- [ ] `<NotesPanel>` renders the notes text in a surface-coloured card with the 📝 label.
- [ ] `<ExpensePopup>` appears as a centred overlay when triggered.
  - [ ] Date label is correct.
  - [ ] Amount input is pre-filled with the current value.
  - [ ] Only non-negative numbers accepted.
  - [ ] Save calls the `onSave` callback and closes.
  - [ ] Cancel closes without saving.
  - [ ] Clicking the overlay closes without saving.
- [ ] `<HeatmapCalendar>` (type="workout"):
  - [ ] Renders a full 52-week grid for the current year.
  - [ ] Month labels row is correct (Jan, Feb … Dec).
  - [ ] Day labels column shows Mon, Wed, Fri.
  - [ ] Empty cells are `#F5EDE9`.
  - [ ] Future cells (after today) are non-clickable.
  - [ ] Clicking a past/today cell cycles colours: empty → light → mid → strong → empty.
  - [ ] The change persists after page refresh.
  - [ ] Year nav arrows work. Next arrow disabled in current year.
  - [ ] Legend shows Less → More with 4 colour boxes.

---

## Section 8 — Daily Tasks (Task 09)

- [ ] Daily Tasks section shows today's date in the header.
- [ ] "+ Add Task" card is always visible at the bottom of the active list.
- [ ] Clicking "+ Add Task" shows an inline text input.
- [ ] Typing a task name and pressing Enter creates the task card.
- [ ] New task is saved in Supabase `tasks` table (visible in dashboard).
- [ ] After page refresh, the task still appears.
- [ ] Clicking the circle on a task marks it complete and moves it to the Completed section.
- [ ] Completed section header shows the correct count.
- [ ] Completed section is collapsed when count = 0.
- [ ] Tasks from a previous day do not appear in the active list today.

---

## Section 9 — Workout Section (Task 10)

- [ ] Workout section shows 3 stat cards: Current Streak (🔥), Longest Streak (🏆), Total Workouts (💪).
- [ ] All stats start at 0 for a new section.
- [ ] Clicking a cell cycles through levels 0→1→2→3→0.
- [ ] After clicking level 1+ on today's cell, Current Streak = 1.
- [ ] After clicking level 1+ on two consecutive days, Current Streak = 2.
- [ ] Longest Streak reflects the maximum run ever.
- [ ] Total Workouts counts all days with level > 0.
- [ ] Stats update without page refresh (after clicking a cell).
- [ ] Data persists after refresh.

---

## Section 10 — Expenses Section (Task 11)

- [ ] Expenses section shows 3 stat cards: Daily Spending (💸), Monthly Spending (📅), Yearly Spending (📊).
- [ ] All stats show ₹0 initially.
- [ ] Clicking a cell opens the ExpensePopup with the correct date.
- [ ] Entering ₹300 and saving: cell shows light colour (#FBA98E). Daily Spending shows ₹300 (if today's cell).
- [ ] Entering ₹800 and saving: cell shows mid colour (#F86A3A).
- [ ] Entering ₹2000 and saving: cell shows strong colour (#F64409).
- [ ] Entering ₹0 and saving: cell resets to empty colour.
- [ ] Monthly and Yearly totals accumulate across multiple entries.
- [ ] Data persists after refresh.

---

## Section 11 — Custom Section (Task 12)

- [ ] Custom section shows the user-defined name (with emoji) as the heading.
- [ ] Stat cards show: Current Streak (🔥), Longest Streak (🏆), Total Days (📅).
- [ ] Notes panel is visible below the heatmap with the text entered during section creation.
- [ ] Cell click cycles 0→1→2→3→0, same as Workout.
- [ ] Two different custom sections have completely independent data (clicking cells in one does not affect the other).
- [ ] Data persists after refresh.

---

## Section 12 — Slideshow & Music Player (Task 13)

- [ ] Slideshow visible in the left panel.
- [ ] For a new user (no custom media): 10 default images cycle in the slideshow.
- [ ] Images cycle automatically every 15 seconds.
- [ ] Dot indicators are visible. Clicking a dot jumps to that image.
- [ ] Music player bar is fixed at the bottom.
- [ ] For a new user: 3 default songs are available.
- [ ] Play button starts audio playback.
- [ ] Pause button pauses.
- [ ] Next/Previous buttons change songs. Song name and index update.
- [ ] Progress bar advances while playing.
- [ ] Clicking the progress bar seeks to that position.
- [ ] Loop button toggles: when on, the same song repeats after it ends.
- [ ] Song plays to the end and advances to the next automatically (when loop is off).

---

## Section 13 — Dashboard Navigation (Task 14)

- [ ] Dashboard loads with "✅ Daily Tasks" as the only tab for a new user.
- [ ] "✅ Daily Tasks" is the active tab by default.
- [ ] "+ Add Section" button is visible to the right of the tabs.
- [ ] "+ Add Section" is visually disabled (greyed out) when there are already 3 sections.
- [ ] Clicking "+ Add Section" opens the Add Section modal (Task 15 must be done).
- [ ] Clicking a different tab switches the section body.
- [ ] The active tab is visually highlighted (bold text, bottom border in brand-strong colour).
- [ ] Pre-existing sections (from a previous session) appear as tabs immediately on page load.

---

## Section 14 — Add Section Modal (Task 15)

- [ ] Modal opens when "+ Add Section" is clicked.
- [ ] Modal shows 3 option cards: Workout, Expenses, Custom.
- [ ] Clicking the × button or the overlay closes the modal.
- [ ] Clicking **Workout**: new tab appears in nav bar with label "🏋️ Workout". Active tab switches to it. Workout section body is visible. Modal closes.
- [ ] Clicking **Expenses**: new tab appears with label "💰 Expenses". Modal closes.
- [ ] Clicking **Custom**: Custom form appears inside the modal.
  - [ ] Submit button is disabled when either field is empty.
  - [ ] Emoji in the Section Name field is accepted and shown in the tab label.
  - [ ] Clicking "← Back" returns to the option selection view.
  - [ ] Filling both fields and clicking Submit: new tab appears with the custom name. Modal closes.
- [ ] A user cannot add a 4th section — "+" button is disabled at 3 sections.
- [ ] If the DB trigger rejects (tested by adding >3 manually and trying via UI), error appears in modal.

---

## Section 15 — Remove Section (Task 16)

- [ ] Hovering a dynamic section tab (not Daily Tasks) reveals a small × button.
- [ ] Daily Tasks tab has NO × button under any circumstance.
- [ ] Clicking × shows a native confirmation dialog with the section name.
- [ ] Clicking Cancel on the dialog does nothing.
- [ ] Clicking OK removes the tab from the nav bar immediately.
- [ ] After removing the active section, the active tab switches to Daily Tasks.
- [ ] The removed section's rows are gone from the Supabase `sections` table.
- [ ] The removed section's entries are gone from the Supabase `entries` table (CASCADE verified).
- [ ] After removing a section, "+ Add Section" becomes enabled again (if was at limit).
- [ ] Can create a new section after deleting one — total never exceeds 3.

---

## Section 16 — Profile Page (Task 17)

**Images**:
- [ ] Profile page accessible from the header profile avatar.
- [ ] Images panel shows "🖼️ Images (0 / 10)" for a new user.
- [ ] Clicking "Upload Image" opens a file picker filtered to image formats.
- [ ] Uploading a valid image: thumbnail appears in the grid. Count updates to "1 / 10".
- [ ] Uploaded image row visible in Supabase `user_media` table.
- [ ] Clicking the delete button removes the thumbnail. Count updates.
- [ ] Deleted image row removed from Supabase `user_media` table.
- [ ] Deleted image file removed from Supabase Storage `user-media` bucket.
- [ ] Uploading a 10th image: succeeds. Upload button becomes disabled with the limit message.
- [ ] Attempting to upload an 11th image: upload button is disabled — cannot happen.
- [ ] Uploading a file > 5 MB shows an inline error without uploading.
- [ ] After uploading 1 image, going to `/dashboard` and refreshing: only that image shows in the slideshow (defaults no longer shown).
- [ ] After deleting all custom images, refreshing `/dashboard`: 10 default images show again.

**Songs**:
- [ ] Songs panel shows "🎵 Songs (0 / 5)" for a new user.
- [ ] Clicking "Upload Song" opens a file picker filtered to audio formats.
- [ ] Uploading a valid song: song row appears in list. Count updates to "1 / 5".
- [ ] Clicking the delete button removes the song from the list.
- [ ] Uploading a 5th song succeeds. Upload button becomes disabled at limit.
- [ ] Uploading a file > 20 MB shows an inline error.
- [ ] After uploading 1 song, going to `/dashboard` and refreshing: only that song plays.
- [ ] After deleting all custom songs, refreshing `/dashboard`: 3 default songs play.

---

## Section 17 — Colour Scheme Integrity

Open the browser DevTools, go to the Elements panel, and verify these exact hex values appear throughout the UI. No component should use hardcoded colours that differ from the design tokens.

- [ ] Header bottom border: `#F64409` (brand-strong).
- [ ] Active nav tab bottom border: `#F64409`.
- [ ] "Updates" word in the title: `#F64409`.
- [ ] Heatmap level 1 cells: `#FBA98E`.
- [ ] Heatmap level 2 cells: `#F86A3A`.
- [ ] Heatmap level 3 cells: `#F64409`.
- [ ] Heatmap empty cells: `#F5EDE9`.
- [ ] Card backgrounds: `#FFF8F6`.
- [ ] Primary text: `#1A0A06`.
- [ ] Muted text: `#8A6560`.
- [ ] Page background: `#FFFFFF`.

---

## Section 18 — Cross-User Data Isolation

This is the most critical security check.

- [ ] Log in as **User A**. Add tasks, workout entries, a custom section with entries, upload an image.
- [ ] Log out. Log in as **User B** (different account).
- [ ] User B's dashboard is completely empty — no tasks, no sections, no custom images from User A.
- [ ] User B's slideshow shows the 10 default images (not User A's uploaded image).
- [ ] In Supabase SQL Editor, run: `SELECT * FROM tasks WHERE user_id = '<User-B-UUID>'` — should return 0 rows.
- [ ] In Supabase SQL Editor, run: `SELECT * FROM sections WHERE user_id = '<User-B-UUID>'` — should return 0 rows.
- [ ] Log back in as User A — all User A's data is intact.

---

## Section 19 — Build & Deployment Readiness

- [ ] `npm run build` completes with 0 errors, 0 warnings (or only acceptable Next.js warnings).
- [ ] `.env.local` is in `.gitignore` and does not appear in `git status`.
- [ ] `next.config.js` has the Supabase image domain in `remotePatterns`.
- [ ] All environment variables have been added to the Vercel project settings (if deploying).
- [ ] The app works on the Vercel preview URL (not just localhost).

---

## Final Sign-Off

All sections above are checked. The application is ready.

| Area | Status |
|---|---|
| Project Setup | ☐ Pass |
| Database Schema + RLS + Triggers | ☐ Pass |
| Storage Buckets + Policies + Default Media | ☐ Pass |
| Authentication (Login, Register, Logout) | ☐ Pass |
| Layout & Shell (Header, Slideshow, Player) | ☐ Pass |
| Utility Functions | ☐ Pass |
| Shared Components (Heatmap, StatCards, Popup) | ☐ Pass |
| Daily Tasks Section | ☐ Pass |
| Workout Section | ☐ Pass |
| Expenses Section | ☐ Pass |
| Custom Section | ☐ Pass |
| Slideshow + Music Player | ☐ Pass |
| Dashboard Navigation | ☐ Pass |
| Add Section Modal | ☐ Pass |
| Remove Section | ☐ Pass |
| Profile Page (Images + Songs) | ☐ Pass |
| Colour Scheme Integrity | ☐ Pass |
| Cross-User Data Isolation | ☐ Pass |
| Build & Deployment Readiness | ☐ Pass |
