# Task 03 — Supabase Storage Setup & Default Media Upload

**Goal**: Create the two storage buckets (`defaults` and `user-media`), apply the correct access policies, and upload all 10 default images and 3 default songs from the original MyUpdates app into the `defaults` bucket.

**Prerequisites**: Task 02 (Supabase project must exist).

---

## Steps

### 1. Create the `defaults` bucket (public)
In Supabase dashboard: **Storage → New bucket**.
- Name: `defaults`
- Public bucket: **Yes** (files in this bucket have publicly accessible URLs)
- File size limit: 50 MB
- Allowed MIME types: leave blank (allow all)

No special policy needed — the bucket is public, so all files are readable by anyone without authentication. No user can write to it (only the service role key can, used for the seeding script in Step 3).

### 2. Create the `user-media` bucket (private)
In Supabase dashboard: **Storage → New bucket**.
- Name: `user-media`
- Public bucket: **No** (signed URLs or explicit public URL generation required)
- File size limit: 20 MB
- Allowed MIME types: leave blank

### 3. Apply RLS policy on the `user-media` bucket
In Supabase dashboard: **Storage → Policies → user-media → New policy → For full customisation**.

Run this SQL in the SQL Editor:
```sql
-- Users can SELECT (read), INSERT (upload), UPDATE, and DELETE
-- only objects whose path starts with their own user UUID.
CREATE POLICY "user owns their folder"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'user-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'user-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

This ensures:
- User A can upload to `user-media/{user-A-uuid}/images/photo.jpg`
- User A cannot read or delete `user-media/{user-B-uuid}/images/photo.jpg`

### 4. Upload default images to `defaults` bucket

In Supabase dashboard: **Storage → defaults → Create folder** named `images`.

Then upload all 10 files from `MyUpdates/Images/` into `defaults/images/`:
```
HanumanJi1.jpg
HanumanJi2.jpg
HanumanJi3.png
HanumanJi4.jpg
HanumanJi5.jpg
HanumanJi6.jpg
HanumanJi7.png
HanumanJi8.jpg
HanumanJi9.jpg
HanumanJi10.png
```

### 5. Upload default songs to `defaults` bucket

Create folder `songs` inside `defaults`. Upload all 3 files from `MyUpdates/Bhajan/`:
```
Ram-Naam-Jap-Shri-Ram-Jai-Ram-Jai.mp3
Jai Shree Ram - Thaman S - Topic (128k).mp3
Sri-Ramadootha-Stotram.mp3
```

### 6. Copy default public URLs into `lib/defaults.ts`

After uploading, click each file in Supabase Storage and copy its **Public URL**. The URL pattern is:
```
https://{project-ref}.supabase.co/storage/v1/object/public/defaults/images/HanumanJi1.jpg
```

Create `lib/defaults.ts` with the actual URLs:
```typescript
export const DEFAULT_IMAGES: { url: string; alt: string }[] = [
  { url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/images/HanumanJi1.jpg',  alt: 'HanumanJi 1'  },
  { url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/images/HanumanJi2.jpg',  alt: 'HanumanJi 2'  },
  { url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/images/HanumanJi3.png',  alt: 'HanumanJi 3'  },
  { url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/images/HanumanJi4.jpg',  alt: 'HanumanJi 4'  },
  { url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/images/HanumanJi5.jpg',  alt: 'HanumanJi 5'  },
  { url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/images/HanumanJi6.jpg',  alt: 'HanumanJi 6'  },
  { url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/images/HanumanJi7.png',  alt: 'HanumanJi 7'  },
  { url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/images/HanumanJi8.jpg',  alt: 'HanumanJi 8'  },
  { url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/images/HanumanJi9.jpg',  alt: 'HanumanJi 9'  },
  { url: 'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/images/HanumanJi10.png', alt: 'HanumanJi 10' },
]

export const DEFAULT_SONGS: { name: string; url: string }[] = [
  {
    name: 'Ram Naam Jap',
    url:  'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/songs/Ram-Naam-Jap-Shri-Ram-Jai-Ram-Jai.mp3',
  },
  {
    name: 'Jai Shree Ram',
    url:  'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/songs/Jai%20Shree%20Ram%20-%20Thaman%20S%20-%20Topic%20(128k).mp3',
  },
  {
    name: 'Sri Ramadootha Stotram',
    url:  'https://YOUR_PROJECT.supabase.co/storage/v1/object/public/defaults/songs/Sri-Ramadootha-Stotram.mp3',
  },
]
```

> **Note**: Replace `YOUR_PROJECT` with your actual Supabase project reference (visible in your project URL).

---

## Files Created / Modified

| File | Action |
|---|---|
| `lib/defaults.ts` | Created — hardcoded public URLs for default images and songs |
| Supabase `defaults` bucket | Created + 10 images + 3 songs uploaded |
| Supabase `user-media` bucket | Created + RLS policy applied |

---

## Done When

- [ ] `defaults` bucket visible in Supabase Storage dashboard.
- [ ] All 10 default images accessible via their public URLs in a browser (no login required).
- [ ] All 3 default songs accessible via their public URLs in a browser.
- [ ] `user-media` bucket exists with RLS policy applied.
- [ ] `lib/defaults.ts` exists and contains 10 image entries and 3 song entries with real Supabase URLs (not placeholder URLs).
- [ ] Attempting to access `user-media` bucket without auth returns a permission error (test in browser: paste a `user-media` URL → should get a 400 or 403 response).
