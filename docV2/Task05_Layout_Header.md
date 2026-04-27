# Task 05 — Layout & Header Dynamic Profile + Theme

**Dependencies**: Tasks 01, 02, 03  
**Files modified**: `app/layout.tsx`, `components/layout/Header.tsx`, `lib/utils.ts`

---

## app/layout.tsx Changes

The root layout now:
1. Fetches the user's `profiles` row (selected_profile, theme_color, custom_theme_*)
2. Resolves theme colors from `lib/themes.ts`
3. Resolves images from `lib/utils.ts → resolveImages(profile, userMedia)`
4. Resolves songs from `lib/utils.ts → resolveSongs(profile, userMedia)`
5. Resolves logo path from `lib/utils.ts → resolveLogoPath(profile, userMedia)`
6. Injects theme as inline CSS variables on `<html>`
7. Passes `logoSrc` to `<Header>`

### Conditional media fetch

For preset profiles, no `user_media` query is needed for images/songs. Only for `custom` profile (or to get the custom logo) do we query `user_media`.

```typescript
let userProfile = { selected_profile: 'HanumanJi', theme_color: 'orange', ... }
let userMedia: UserMediaItem[] = []

if (user) {
  const { data: profileRow } = await supabase
    .from('profiles')
    .select('selected_profile, theme_color, custom_theme_c1, custom_theme_c2, custom_theme_c3')
    .eq('id', user.id).single()
  
  userProfile = profileRow ?? userProfile

  // Only fetch user_media if custom profile (needs images/songs/logo)
  if (userProfile.selected_profile === 'custom') {
    const { data: media } = await supabase
      .from('user_media').select('*').eq('user_id', user.id)
    // generate signed URLs ...
    userMedia = mediaWithUrls
  }
}

const theme = resolveTheme(userProfile)
const imageUrls = resolveImages(userProfile, userMedia)
const songs = resolveSongs(userProfile, userMedia)
const logoSrc = resolveLogoPath(userProfile, userMedia)
```

---

## components/layout/Header.tsx Changes

Accepts `logoSrc: string` prop instead of hardcoded `/logo/HanumanJiLogo.jpeg`:

```tsx
interface HeaderProps {
  userEmail: string | null
  logoSrc: string          // ← new
}

// Inside component:
<Image src={logoSrc} alt="MyUpdates Logo" ... />
```

---

## lib/utils.ts — New Functions

### resolveImages (updated signature)

```typescript
export function resolveImages(
  profile: UserProfile,
  userMedia: UserMediaItem[],
): { url: string; alt: string }[] {
  if (profile.selected_profile === 'custom') {
    const images = userMedia.filter(m => m.type === 'image')
    return images.length > 0
      ? images.map(m => ({ url: m.display_url ?? m.public_url, alt: m.display_name }))
      : DEFAULT_IMAGES
  }
  const def = PROFILE_DEFINITIONS[profile.selected_profile]
  return def?.images ?? DEFAULT_IMAGES
}
```

### resolveSongs (updated signature)

```typescript
export function resolveSongs(
  profile: UserProfile,
  userMedia: UserMediaItem[],
): { name: string; url: string }[] {
  if (profile.selected_profile === 'custom') {
    const songs = userMedia.filter(m => m.type === 'song')
    return songs.length > 0
      ? songs.map(m => ({ name: m.display_name, url: m.display_url ?? m.public_url }))
      : DEFAULT_SONGS
  }
  const def = PROFILE_DEFINITIONS[profile.selected_profile]
  if (!def || def.songs.length === 0) return DEFAULT_SONGS
  return def.songs
}
```

### resolveLogoPath (new)

```typescript
export function resolveLogoPath(
  profile: UserProfile,
  userMedia: UserMediaItem[],
): string {
  if (profile.selected_profile === 'custom') {
    const logo = userMedia.find(m => m.type === 'logo')
    return logo?.display_url ?? logo?.public_url ?? '/logo/HanumanJiLogo.jpeg'
  }
  return PROFILE_DEFINITIONS[profile.selected_profile]?.logoPath ?? '/logo/HanumanJiLogo.jpeg'
}
```

### resolveTheme (new)

```typescript
export function resolveTheme(profile: UserProfile): ThemeDefinition {
  if (profile.theme_color === 'custom' && profile.custom_theme_c3) {
    return deriveCustomTheme(profile.custom_theme_c3, profile.custom_theme_c1, profile.custom_theme_c2)
  }
  return THEME_DEFINITIONS[profile.theme_color] ?? THEME_DEFINITIONS.orange
}
```

---

## Verification

- [ ] HanumanJi profile → HanumanJi logo in header, HanumanJi images in slideshow
- [ ] GaneshaJi profile → Ganesha logo in header, Ganesha images in slideshow
- [ ] Orange theme → orange brand colors throughout
- [ ] Red theme → red brand colors throughout
- [ ] Blue theme → blue brand colors throughout
- [ ] No user (unauthenticated) → default orange HanumanJi logo (graceful fallback)
