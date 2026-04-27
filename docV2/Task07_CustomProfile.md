# Task 07 — Custom Profile Upload Handling

**Dependencies**: Tasks 01, 02, 05, 06  
**Files modified**: `components/profile/ProfilePage.tsx`, `lib/utils.ts`, `supabase/migration-v2.sql`

---

## Custom Profile Media Flow

When `selected_profile === 'custom'`, the user manages their own slideshow images, music player songs, and header logo through the Profile page.

### Logo Type in user_media

A new `type = 'logo'` is added to the `user_media` table (see Task 02 migration). There is at most 1 logo per user at any time (new upload replaces old).

### DB limit trigger note

The existing image limit trigger (max 10) and song limit trigger (max 5) only fire for their respective types. The logo type is not covered by any trigger — the front-end enforces "max 1 logo" by deleting the old one before inserting the new.

---

## ProfilePage.tsx — Logo Upload Panel

Shown only when `selectedProfile === 'custom'`:

```
┌──────────────────────────────────┐
│ 🖼 Logo  (1 / 1)                 │
│                                  │
│  [preview 96×96 circle]          │
│  MyLogo.jpg                      │
│                                  │
│  [Upload Logo]   [Remove Logo]   │
└──────────────────────────────────┘
```

- File picker: `.jpg .jpeg .png .webp`, max 2 MB
- Upload flow:
  1. Delete existing logo (if any) from Supabase Storage + DB
  2. Upload new file to `{userId}/logo/{uuid}.{ext}` in `user-media` bucket
  3. Insert `user_media` row with `type = 'logo'`
  4. Update local state
- Remove flow: Delete from Storage + DB

---

## lib/utils.ts — resolveLogoPath

For `custom` profile:
- Finds `user_media` item with `type === 'logo'`
- Uses its `display_url` (signed URL generated server-side in layout.tsx)
- Falls back to `/logo/HanumanJiLogo.jpeg` if none uploaded

---

## app/layout.tsx — user_media fetch scope

When `selected_profile === 'custom'`:
- Fetch all `user_media` rows (images + songs + logo)
- Generate signed URLs for all
- Pass to resolveImages / resolveSongs / resolveLogoPath

This keeps the DB query conditional — preset profiles don't need any `user_media` fetch.

---

## UserMediaItem Type Extension

```typescript
export interface UserMediaItem {
  id: string
  type: 'image' | 'song' | 'logo'   // ← logo added
  storage_path: string
  public_url: string
  display_name: string
  display_url?: string
}
```

---

## next.config.js — Signed URL Domain

If Supabase signed URLs use a different subdomain or path pattern, ensure it is covered by `remotePatterns`. Current pattern covers `*.supabase.co/storage/v1/object/public/**`. Signed URLs use `/object/sign/**` — add this pattern:

```javascript
{
  protocol: 'https',
  hostname: '*.supabase.co',
  pathname: '/storage/v1/object/sign/**',
},
```

---

## Verification

- [ ] Custom profile: logo upload UI appears
- [ ] Upload logo → logo appears in header immediately (or after reload)
- [ ] Remove logo → header falls back to HanumanJi default logo
- [ ] Uploading a 2nd logo replaces the first (no duplicate DB rows)
- [ ] Preset profile: logo upload UI is hidden
- [ ] `user_media` rows with `type = 'logo'` visible in Supabase table
