# Task 01 — Static Assets & Profile/Theme Definitions

**Dependencies**: None (foundation task)  
**Files created**: `public/profiles/*`, `lib/profiles.ts`, `lib/themes.ts`  
**Files modified**: None

---

## Steps

### 1.1 Copy Profiles → public/profiles/

Run in project root:
```bash
cp -r Profiles/HanumanJi       public/profiles/HanumanJi
cp -r Profiles/GaneshaJi       public/profiles/GaneshaJi
cp -r Profiles/KrishanJi       public/profiles/KrishanJi
cp -r Profiles/NavaratriSpecial public/profiles/NavaratriSpecial
cp -r Profiles/PremanandJi     public/profiles/PremanandJi
cp -r Profiles/RamJi           public/profiles/RamJi
cp -r Profiles/ShivaJi         public/profiles/ShivaJi
cp -r Profiles/Vrindavan       public/profiles/Vrindavan
```

Files are then accessible at:  
`/profiles/HanumanJi/HanumanJi1.jpg`, `/profiles/HanumanJi/HanumanJiLogo.jpeg`, etc.

Song files with spaces in names must be URL-encoded in code (e.g., `Jai%20Shree%20Ram...mp3`).

### 1.2 Create lib/profiles.ts

Defines `PROFILE_DEFINITIONS` — a record mapping profile ID → `ProfileDefinition`:

```typescript
interface ProfileDefinition {
  id: string
  name: string
  logoPath: string
  images: { url: string; alt: string }[]
  songs: { name: string; url: string }[]
}
```

- All 8 preset profiles populated with their file lists
- `HanumanJi` includes 3 songs (URL-encoded)
- Others have `songs: []` (placeholder — songs to be added in future)
- A `PROFILE_ORDER` array defines display order for UI cards

### 1.3 Create lib/themes.ts

Defines `THEME_DEFINITIONS` record:

```typescript
interface ThemeDefinition {
  id: string
  name: string
  c1: string       // brand-light
  c2: string       // brand-mid
  c3: string       // brand-strong
  surface: string
  empty: string
  border: string
  borderStrong: string
}
```

Three presets: orange, red, blue  
Plus helpers: `deriveCustomTheme(baseHex)` → computes c2 and c1 from base (HSL lightening)

---

## Verification

- [ ] `ls public/profiles/` shows 8 subdirectories
- [ ] `public/profiles/HanumanJi/HanumanJiLogo.jpeg` exists
- [ ] `public/profiles/HanumanJi/Songs/` contains 3 .mp3 files
- [ ] `lib/profiles.ts` exports `PROFILE_DEFINITIONS` and `PROFILE_ORDER`
- [ ] `lib/themes.ts` exports `THEME_DEFINITIONS` and `deriveCustomTheme`
