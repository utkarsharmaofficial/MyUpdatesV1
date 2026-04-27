# Task 17 — Profile Page (Media Management)

**Goal**: Build the `/profile` page where users manage their personal images and songs. Users can upload up to 10 images and 5 songs, delete any of them, and see live counts. When media is removed so that the count reaches 0, the app falls back to defaults automatically on the next dashboard load.

**Prerequisites**: Task 06 (Header links to /profile), Task 04 (Supabase client for Storage operations), Task 03 (user-media bucket with RLS exists).

---

## Steps

### 1. Create `app/profile/page.tsx` — Server Component Shell

Pre-fetches the user's existing media and passes it to the client component:

```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfilePage from '@/components/profile/ProfilePage'

export default async function Profile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: media } = await supabase
    .from('user_media')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return <ProfilePage initialMedia={media ?? []} userId={user.id} />
}
```

### 2. Create `components/profile/ProfilePage.tsx` — Client Component

**Props**:
```typescript
interface ProfilePageProps {
  initialMedia: UserMediaItem[]
  userId: string
}
```

**Internal state**:
- `media: UserMediaItem[]` — starts from `initialMedia`. Updated after upload or delete.

Derived:
```typescript
const images = media.filter(m => m.type === 'image')
const songs  = media.filter(m => m.type === 'song')
```

**Layout**:
```
[← Back to Dashboard]
[Page title: "Your Media"]

[Images Panel]   [Songs Panel]
```

The two panels are side by side on wide screens, stacked on mobile.

---

### 3. Images Panel

**Header**: "🖼️ Images (X / 10)"

**Thumbnail grid**:
- Each uploaded image: a `<div>` with a rounded `<img>` thumbnail + a delete button (🗑️ icon) in the top-right corner of the thumbnail.
- Thumbnail: 100×100px, `object-fit: cover`, `border-radius: 8px`.
- Delete button: absolute positioned, `bg-brand-strong text-white rounded-full`.

**Upload button**:
- Label: "Upload Image".
- Disabled with message "Maximum 10 images reached. Delete one to add more." when `images.length >= 10`.
- When enabled: opens a hidden `<input type="file" accept=".jpg,.jpeg,.png,.webp">` via a `useRef`.

**Upload flow**:
```typescript
async function handleImageUpload(file: File) {
  if (images.length >= 10) return  // frontend guard
  if (file.size > 5 * 1024 * 1024) {
    setError('Image must be under 5 MB.')
    return
  }

  setUploading(true)
  const ext  = file.name.split('.').pop()
  const path = `${userId}/images/${crypto.randomUUID()}.${ext}`

  const { error: storageError } = await supabase
    .storage.from('user-media').upload(path, file)
  if (storageError) { setError(storageError.message); setUploading(false); return }

  const { data: urlData } = supabase
    .storage.from('user-media').getPublicUrl(path)

  const { data: row, error: dbError } = await supabase
    .from('user_media')
    .insert({
      user_id:      userId,
      type:         'image',
      storage_path: path,
      public_url:   urlData.publicUrl,
      display_name: file.name,
    })
    .select()
    .single()

  if (dbError) { setError(dbError.message); setUploading(false); return }

  setMedia(prev => [...prev, row])
  setUploading(false)
}
```

**Delete flow**:
```typescript
async function handleDeleteMedia(item: UserMediaItem) {
  const { error: storageError } = await supabase
    .storage.from('user-media').remove([item.storage_path])
  if (storageError) { setError(storageError.message); return }

  await supabase.from('user_media').delete().eq('id', item.id)

  setMedia(prev => prev.filter(m => m.id !== item.id))
}
```

---

### 4. Songs Panel

**Header**: "🎵 Songs (X / 5)"

**Song list**:
- Each uploaded song: a row with the `display_name` on the left and a delete button (🗑️) on the right.
- Optionally show a small ▶ play preview button that creates a temporary `Audio` element.

**Upload button**:
- Label: "Upload Song".
- Disabled with message "Maximum 5 songs reached. Delete one to add more." when `songs.length >= 5`.
- Opens a hidden `<input type="file" accept=".mp3,.m4a,.ogg">`.

**Upload flow**: identical to images, with:
- `type: 'song'`
- `path: ${userId}/songs/${uuid}.${ext}`
- File size limit: 20 MB.

**Delete flow**: identical to images.

---

### 5. Error and loading states

- `uploading: boolean` — show a spinner overlay or disable the upload button with "Uploading…".
- `error: string | null` — show inline error message below the affected panel.
- `deleting: string | null` — the ID of the item currently being deleted (shows spinner on that item's delete button).

---

### 6. Back navigation

A "← Back to Dashboard" link at the top using Next.js `<Link href="/dashboard">`.

---

## Files Created / Modified

| File | Action |
|---|---|
| `app/profile/page.tsx` | Created — server component, fetches user media |
| `components/profile/ProfilePage.tsx` | Created — client component, images + songs panels |

---

## Done When

- [ ] `/profile` is accessible from the header profile avatar link.
- [ ] Profile page shows two panels: Images and Songs.
- [ ] Both panels show current counts and the X/limit display ("3 / 10", "1 / 5", etc.).
- [ ] Clicking "Upload Image" opens the file picker, filtered to image formats only.
- [ ] Uploading an image shows it as a thumbnail in the grid immediately.
- [ ] The uploaded image appears in the `user_media` table in Supabase (verify in dashboard).
- [ ] Clicking the delete button on a thumbnail removes it from the grid and from Supabase.
- [ ] Upload button is disabled and shows the limit message when images = 10.
- [ ] Same for songs: upload, see in list, delete, limit enforced at 5.
- [ ] Files over the size limit show an inline error without uploading.
- [ ] After deleting all images, going back to the dashboard shows the 10 default images in the slideshow (refresh required).
- [ ] After uploading 1 image and going to the dashboard, only that image shows in the slideshow (refresh required).
- [ ] "← Back to Dashboard" navigates back correctly.
- [ ] No TypeScript errors.
