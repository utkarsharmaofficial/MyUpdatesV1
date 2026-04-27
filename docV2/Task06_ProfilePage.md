# Task 06 — Profile Page Settings Update

**Dependencies**: Tasks 01, 02, 03, 04  
**Files modified**: `app/profile/page.tsx`, `components/profile/ProfilePage.tsx`

---

## Updated Profile Page Layout

The profile page is restructured into two sections:

### Section A — Profile & Theme Settings (top, always visible)

Reuses the same `ProfileStep` and `ThemeStep` UI from the onboarding wizard.

- Shows current profile selected (ring highlight)
- Shows current theme selected (ring highlight)
- "Save Changes" button → calls `saveOnboardingPreferences()` server action
- On success: shows a toast "Preferences saved! Reload to see changes." (page reload applies new logo/colors from layout.tsx)

### Section B — Custom Media (bottom, only visible when `selected_profile === 'custom'`)

Same as current profile page media panels:
- Images panel (upload/delete, limit 10)
- Songs panel (upload/delete, limit 5)
- Logo panel (upload/delete, limit 1) ← NEW

Logo panel:
- Shows current logo as a 96×96px circle preview if uploaded
- "Upload Logo" button → file picker (jpg/jpeg/png/webp, max 2 MB)
- On upload: deletes any existing logo row, uploads new file, inserts new row with `type = 'logo'`
- "Remove Logo" button → deletes file + DB row, falls back to default

---

## app/profile/page.tsx Changes

Now also fetches the user's profile row to pass to the component:

```typescript
const [{ data: media }, { data: profileRow }] = await Promise.all([
  supabase.from('user_media').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
  supabase.from('profiles').select('selected_profile, theme_color, custom_theme_c1, custom_theme_c2, custom_theme_c3').eq('id', user.id).single(),
])

// ... generate signed URLs for media ...

return <ProfilePage
  initialMedia={mediaWithUrls}
  userId={user.id}
  userProfile={profileRow ?? { selected_profile: 'HanumanJi', theme_color: 'orange', custom_theme_c1: null, custom_theme_c2: null, custom_theme_c3: null }}
/>
```

---

## components/profile/ProfilePage.tsx Changes

New prop: `userProfile: UserProfile`

New state:
- `selectedProfile: string` (from userProfile.selected_profile)
- `selectedTheme: string` (from userProfile.theme_color)
- `customColor: string` (from userProfile.custom_theme_c3 or '#FF6600')
- `savingPrefs: boolean`
- `prefsSaved: boolean`

New handler:
```typescript
async function handleSavePreferences() {
  setSavingPrefs(true)
  const { c1, c2 } = selectedTheme === 'custom' ? deriveCustomTheme(customColor) : THEME_DEFINITIONS[selectedTheme]
  await saveOnboardingPreferences(
    selectedProfile,
    selectedTheme,
    selectedTheme === 'custom' ? c1 : undefined,
    selectedTheme === 'custom' ? c2 : undefined,
    selectedTheme === 'custom' ? customColor : undefined,
  )
  setSavingPrefs(false)
  setPrefsSaved(true)
  setTimeout(() => setPrefsSaved(false), 3000)
}
```

Logo upload handler (new, for custom profile):
```typescript
async function handleLogoUpload(file: File) {
  // Delete existing logo from storage + DB
  const existing = media.find(m => m.type === 'logo')
  if (existing) await handleDelete(existing)
  // Upload new logo
  await handleUpload(file, 'logo')
}
```

---

## Verification

- [ ] Profile page shows profile selector grid at top
- [ ] Profile page shows theme selector at top
- [ ] Clicking different profile → card highlights
- [ ] Clicking different theme → swatch highlights with live preview
- [ ] Save Changes → success message appears
- [ ] After page reload, header logo + theme colors reflect the change
- [ ] Custom profile selected → media panels appear below
- [ ] Non-custom profile selected → media panels hidden
- [ ] Logo upload appears in custom section → uploads correctly
- [ ] Logo appears in header after reload
