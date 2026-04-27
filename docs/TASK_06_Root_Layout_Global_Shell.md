# Task 06 — Root Layout & Global Shell

**Goal**: Build `app/layout.tsx` — the persistent shell that wraps every page. It contains the sticky header (logo, title, profile link, logout), the two-column layout structure (left panel for the slideshow, right column for content), and the fixed bottom music player bar. Media data is not fetched yet — placeholders are used and will be wired in Task 13.

**Prerequisites**: Task 05 (signOut action exists), Task 01 (Tailwind colour tokens in place).

---

## Steps

### 1. Create `components/layout/Header.tsx`
A Client Component. Uses the `signOut` Server Action via a form.

**Elements:**
- Left: logo image (`/logo/HanumanJiLogo.jpeg`, 36×36px, rounded corners) + title "My **Updates**" (Updates in `text-brand-strong`).
- Right: a link to `/profile` (user avatar placeholder — a circle with the first letter of the user's email, or a generic icon) + logout form button.
- Bottom border: `border-b-2 border-brand-strong`.
- Sticky top, `z-index: 50`, white background.

To get the current user's email for the avatar, accept it as a prop (`userEmail: string`). The layout fetches it from Supabase on the server.

```typescript
interface HeaderProps {
  userEmail: string | null
}
```

The profile avatar is a `<Link href="/profile">` wrapping a circle `<div>` showing the first character of the email (uppercase), styled with `bg-brand-light text-app-text`.

### 2. Create `components/layout/MusicPlayer.tsx` — Placeholder
Create the player bar shell with the correct layout and styling but with placeholder/disabled controls. The actual song loading and audio logic is done in Task 13.

The component accepts a `songs` prop (can be empty array for now).

**Layout (fixed bottom bar, always visible):**
- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 100`
- Background: white, top border: `border-t border-border`.
- Height: 72px.
- Contents (left to right): 🎵 icon | Song name + index | Progress bar | Time | Controls (⏮ ▶/⏸ ⏭ 🔁)

All controls disabled/non-functional in this task. Wire to real audio in Task 13.

### 3. Create `components/layout/Slideshow.tsx` — Placeholder
A Client Component. Accepts `imageUrls: string[]` prop. For now render the first image as a static `<img>`. Actual cycling and dot indicators are done in Task 13.

### 4. Create `app/layout.tsx`
```typescript
import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Slideshow from '@/components/layout/Slideshow'
import MusicPlayer from '@/components/layout/MusicPlayer'

export const metadata: Metadata = {
  title: 'My Updates',
  description: 'Track your grind',
  icons: { icon: '/logo/HanumanJiLogo.jpeg' },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en">
      <body>
        <Header userEmail={user?.email ?? null} />

        <div className="page-layout">
          {/* Left: image slideshow — placeholder until Task 13 */}
          <div className="image-panel">
            <Slideshow imageUrls={[]} />
          </div>

          {/* Right: page content */}
          <div className="right-column">
            {children}
          </div>
        </div>

        {/* Fixed bottom music player — placeholder until Task 13 */}
        <MusicPlayer songs={[]} />
      </body>
    </html>
  )
}
```

### 5. Add layout CSS to `globals.css`
The layout uses a fixed-height shell so the page never scrolls — only the right column scrolls internally. This keeps the image panel fully visible (including dot indicators) at all times.

```css
/* body never scrolls — right-column scrolls internally */
body {
  overflow: hidden;
}

/* header (52px) + page-layout + music player (72px) = 100vh exactly */
.page-layout {
  display: flex;
  height: calc(100vh - 52px - 72px);
}

/* Image panel is always fully visible — no sticky needed */
.image-panel {
  width: 26%;
  min-width: 200px;
  height: 100%;
  overflow: hidden;
  flex-shrink: 0;
  border-right: 1px solid #F0E8E5;
}

/* Only this column scrolls */
.right-column {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding: 24px 32px;
}
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/layout/Header.tsx` | Created — sticky header with logo, title, profile link, logout |
| `components/layout/Slideshow.tsx` | Created — placeholder (single image, no cycling yet) |
| `components/layout/MusicPlayer.tsx` | Created — placeholder (bar present, controls disabled) |
| `app/layout.tsx` | Created — root layout wiring all shell components |
| `app/globals.css` | Modified — `.page-layout`, `.image-panel`, `.right-column` classes added |

---

## Done When

- [ ] Every page (`/`, `/dashboard`, `/profile`) shows the sticky header with logo and "My Updates" title.
- [ ] Header has a profile avatar link (navigates to `/profile`) and a working logout button.
- [ ] Logout via the header button clears the session and redirects to `/`.
- [ ] `/dashboard` shows the two-column layout: left panel (26%) + right column (74%).
- [ ] Fixed music player bar is visible at the bottom of every page (controls can be disabled/greyed out).
- [ ] Colour scheme matches original: `#F64409` header border, white background, `#1A0A06` text.
- [ ] No layout shift or TypeScript errors.
