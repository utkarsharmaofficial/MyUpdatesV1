# Architecture V2 — MyUpdates V1 (Profile & Theme Update)

> **Date**: 2026-04-27  
> Extends `docs/ARCHITECTURE.md` with V2 changes: profile system, dynamic themes, onboarding flow.

---

## What Changed from V1

| Area | V1 | V2 |
|---|---|---|
| Logo | Static HanumanJi logo | Dynamic: loaded from user's selected profile |
| Slideshow images | User uploads OR HanumanJi defaults | From selected profile's preset image set (or user uploads for Custom) |
| Music player songs | User uploads OR HanumanJi defaults | From selected profile's song set (or user uploads for Custom) |
| Colour theme | Hardcoded orange (#FBA98E / #F86A3A / #F64409) | User-chosen: Orange / Red / Blue / Custom picker |
| First-login flow | Direct to /dashboard | /dashboard → /onboarding (2-step wizard) → /dashboard |
| Profile page | Media upload only | Profile selector + Theme selector + Media upload (Custom only) |

---

## New Routes

| Route | Description |
|---|---|
| `/onboarding` | 2-step wizard shown to every new user exactly once. Step 1: choose profile. Step 2: choose theme. |

---

## New Library Files

| File | Purpose |
|---|---|
| `lib/profiles.ts` | All 8 preset profile definitions (images, logo, songs) + Custom placeholder |
| `lib/themes.ts` | 3 preset theme definitions (Orange, Red, Blue) + custom derivation helpers |

---

## Database Schema Changes (migration-v2.sql)

Added to `profiles` table:

```sql
ALTER TABLE profiles
  ADD COLUMN selected_profile   text    NOT NULL DEFAULT 'HanumanJi',
  ADD COLUMN theme_color        text    NOT NULL DEFAULT 'orange',
  ADD COLUMN custom_theme_c1    text,
  ADD COLUMN custom_theme_c2    text,
  ADD COLUMN custom_theme_c3    text,
  ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;
```

Extended `user_media` type constraint to include `'logo'`:

```sql
ALTER TABLE user_media DROP CONSTRAINT user_media_type_check;
ALTER TABLE user_media ADD CONSTRAINT user_media_type_check
  CHECK (type IN ('image', 'song', 'logo'));
```

---

## Dynamic Theme System

Themes are implemented using **CSS custom properties** (CSS variables):

1. `globals.css` declares default variable values (orange).
2. `tailwind.config.ts` maps `brand-light`, `brand-mid`, `brand-strong`, `surface`, `empty`, `border`, `border-strong` to `var(--brand-light)` etc.
3. `app/layout.tsx` reads the user's theme from DB and injects an inline `style` on `<html>`:
   ```tsx
   <html style={{ '--brand-light': theme.c1, ... } as React.CSSProperties}>
   ```
4. All existing component code (using `bg-brand-strong`, `text-brand-mid`, etc.) works unchanged — only the CSS variable values change.

### Theme Definitions

| Theme | c1 (light) | c2 (mid) | c3 (strong) |
|---|---|---|---|
| Orange (default) | `#FBA98E` | `#F86A3A` | `#F64409` |
| Red | `#FFB3AD` | `#FF6259` | `#FF0000` |
| Blue | `#A0C4FF` | `#4488FF` | `#0000FF` |
| Custom | user-derived | user-derived | user-picked |

For Custom, user picks a base color from a color-wheel picker. Two lighter shades are auto-derived in HSL space (+18% and +33% lightness from the strong color).

---

## Profile System

### Preset Profiles (8 total)

All images/songs are served as **static files** from `public/profiles/`:

| Profile ID | Display Name | Has Songs |
|---|---|---|
| `HanumanJi` | Hanuman Ji | Yes (3 songs) |
| `GaneshaJi` | Ganesha Ji | No (placeholder) |
| `KrishanJi` | Krishan Ji | No (placeholder) |
| `NavaratriSpecial` | Navratri Special | No (placeholder) |
| `PremanandJi` | Premanand Ji | No (placeholder) |
| `RamJi` | Ram Ji | No (placeholder) |
| `ShivaJi` | Shiva Ji | No (placeholder) |
| `Vrindavan` | Vrindavan | No (placeholder) |

Profiles without songs fall back to HanumanJi's 3 songs as default.

### Custom Profile

- `selected_profile = 'custom'`
- Logo: uploaded via Profile page → stored in `user_media` with `type = 'logo'`
- Images: uploaded via Profile page → stored in `user_media` with `type = 'image'`
- Songs: uploaded via Profile page → stored in `user_media` with `type = 'song'`
- If no uploads: falls back to HanumanJi defaults

---

## Onboarding Flow

```
New user signs up → (auto-login if email confirm disabled)
→ /dashboard page.tsx checks profiles.onboarding_completed
→ false → redirect('/onboarding')

/onboarding → OnboardingWizard (client component)
  Step 1: ProfileStep — 9 cards (8 preset + Custom), user clicks one
  Step 2: ThemeStep — 4 swatches (Orange, Red, Blue, Custom picker)
  → Submit → saveOnboardingPreferences() server action
    → UPDATE profiles SET selected_profile, theme_color, ..., onboarding_completed = true
  → router.push('/dashboard')
```

---

## Media Resolution Logic (updated lib/utils.ts)

```
resolveImages(userProfile, userMedia):
  if userProfile.selected_profile === 'custom':
    if userMedia has images → return userMedia images
    else → return DEFAULT_IMAGES (HanumanJi)
  else:
    return PROFILE_DEFINITIONS[userProfile.selected_profile].images

resolveSongs(userProfile, userMedia):
  if userProfile.selected_profile === 'custom':
    if userMedia has songs → return userMedia songs
    else → return DEFAULT_SONGS (HanumanJi)
  else:
    profile = PROFILE_DEFINITIONS[userProfile.selected_profile]
    if profile.songs.length > 0 → return profile.songs
    else → return DEFAULT_SONGS (fallback)

resolveLogoPath(userProfile, userMedia):
  if userProfile.selected_profile === 'custom':
    logo = userMedia.find(type === 'logo')
    if logo → return logo.display_url
    else → return '/logo/HanumanJiLogo.jpeg' (default)
  else:
    return PROFILE_DEFINITIONS[userProfile.selected_profile].logoPath
```

---

## Component Tree Changes

```
app/layout.tsx  (Server Component)
├── reads: user profile + theme from DB
├── injects: CSS theme variables via <html style={...}>
├── <Header logoSrc={resolvedLogoPath} userEmail />   ← NOW DYNAMIC LOGO
├── <Slideshow imageUrls={resolvedImages} />           ← profile-based images
└── <MusicPlayer songs={resolvedSongs} />              ← profile-based songs

app/onboarding/page.tsx  (Server Component, auth guard)
└── <OnboardingWizard />  (Client)
    ├── <ProfileStep />   — 9 profile cards
    └── <ThemeStep />     — 4 theme swatches + color picker

app/dashboard/page.tsx  (Server Component)
├── checks onboarding_completed → redirect if false
└── <Dashboard /> (unchanged)

app/profile/page.tsx  (Server Component)
├── fetches: user profile row (selected_profile, theme_color, custom_theme_*)
├── fetches: user media (images, songs, logo)
└── <ProfilePage initialMedia userProfile />   ← UPDATED PROPS

components/profile/ProfilePage.tsx  (Client)
├── <ProfileSettings />   ← NEW: profile + theme selector (same as onboarding)
└── <MediaPanel />        ← shown only for custom profile
```
