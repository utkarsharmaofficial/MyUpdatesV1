# Task 13 — Image Slideshow & Music Player (Media Layer)

**Goal**: Fully implement the `Slideshow` component (15-second image cycling with dot indicators) and the `MusicPlayer` component (play/pause/prev/next/loop with progress bar and time display). Wire both to the user's media from Supabase — falling back to defaults if the user has no custom media. Replace the Task 06 placeholders.

**Prerequisites**: Task 06 (placeholder components exist in layout), Task 07 (`resolveImages`, `resolveSongs`, `formatTime` utilities), Task 03 (`lib/defaults.ts` with real URLs).

---

## Steps

### 1. Update `components/layout/Slideshow.tsx` — Full Implementation

A Client Component (`'use client'`).

**Props**:
```typescript
interface SlideshowProps {
  imageUrls: { url: string; alt: string }[]
}
```

**Internal state**:
- `current: number` — index of the currently visible image, starts at 0.

**Behaviour**:
- On mount: set up a `setInterval` that increments `current` every 15,000ms (15 seconds), wrapping around with `% imageUrls.length`.
- Cleanup interval on unmount (`useEffect` return function).
- If `imageUrls` is empty: render nothing (should not happen in practice — defaults always fill in).

**Visual**:
- The entire left panel is the slideshow.
- One `<img>` visible at a time, `object-fit: cover`, fills 100% of the panel width and height.
- Transition: simple opacity fade (CSS transition `opacity 0.5s ease`).
- Dot indicators at the bottom: one dot per image, active dot is filled (`bg-brand-strong`), inactive dots are outlined (`bg-empty border border-border-strong`).
- Clicking a dot jumps to that image and resets the 15-second timer.

---

### 2. Update `components/layout/MusicPlayer.tsx` — Full Implementation

A Client Component (`'use client'`).

**Props**:
```typescript
interface Song {
  name: string
  url: string
}

interface MusicPlayerProps {
  songs: Song[]
}
```

**Internal state**:
- `currentIndex: number` — which song is loaded (starts at 0).
- `isPlaying: boolean`
- `isLooping: boolean`
- `currentTime: number` — current playback position in seconds.
- `duration: number` — total song duration in seconds.

**Implementation using `useRef<HTMLAudioElement>`**:
- Create the audio element as a ref: `const audioRef = useRef<HTMLAudioElement | null>(null)`.
- On mount: `audioRef.current = new Audio(songs[0]?.url)`.
- When `currentIndex` changes: update `audioRef.current.src`, call `.play()` if `isPlaying`.
- Wire events: `timeupdate` → update `currentTime`; `loadedmetadata` → update `duration`; `ended` → advance to next song (or loop if `isLooping`).

**Controls**:
- **Play/Pause** (▶/⏸): toggle `isPlaying`. Call `.play()` or `.pause()` on the audio element.
- **Previous** (⏮): decrement `currentIndex` with wraparound. Start playback.
- **Next** (⏭): increment `currentIndex` with wraparound. Start playback.
- **Loop** (🔁): toggle `isLooping`. When true, the `ended` event replays the same song instead of advancing.

**Progress bar**:
- A `<div>` track with a fill `<div>` whose `width` is `(currentTime / duration) * 100 + '%'`.
- Clicking anywhere on the track seeks: `audioRef.current.currentTime = clickPercent * duration`.
- Colours: track background `bg-empty`, fill `bg-brand-strong`.

**Song name and index display**:
- Song name: `songs[currentIndex]?.name ?? '—'`
- Index: `${currentIndex + 1} / ${songs.length}`

**Time display**:
- Current time: `formatTime(currentTime)` from `lib/utils.ts`.
- Duration: `formatTime(duration)`.

**Full bar layout** (matches original `.player`):
```
🎵  [Song name]          [Progress track]   [0:00 / 3:45]   [⏮] [▶] [⏭] [🔁]
     [Song index]
```

---

### 3. Wire both components in `app/layout.tsx`

Update the layout to fetch user media on the server and pass resolved URLs down:

```typescript
// In app/layout.tsx — inside the async default export
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

let imageUrls: { url: string; alt: string }[] = DEFAULT_IMAGES
let songs: { name: string; url: string }[] = DEFAULT_SONGS

if (user) {
  const { data: media } = await supabase
    .from('user_media')
    .select('*')
    .eq('user_id', user.id)

  imageUrls = resolveImages(media ?? [])
  songs = resolveSongs(media ?? [])
}
```

Pass to components:
```tsx
<Slideshow imageUrls={imageUrls} />
<MusicPlayer songs={songs} />
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/layout/Slideshow.tsx` | Updated — full cycling + dot indicators |
| `components/layout/MusicPlayer.tsx` | Updated — full audio player with all controls |
| `app/layout.tsx` | Updated — fetches and resolves media, passes to Slideshow + MusicPlayer |

---

## Done When

- [ ] Slideshow cycles through images every 15 seconds automatically.
- [ ] Dot indicators appear. Clicking a dot jumps to that image.
- [ ] For a new user (no uploads), all 10 default images are shown in the slideshow.
- [ ] Music player bar is always visible at the bottom.
- [ ] Play/Pause button works — audio plays from the first default song.
- [ ] Next/Previous buttons work — song name and index update.
- [ ] Progress bar advances while playing. Clicking it seeks correctly.
- [ ] Loop button toggles looping — when on, the same song repeats.
- [ ] For a new user (no uploads), all 3 default songs are available in the player.
- [ ] After a user uploads a custom image on the Profile page (Task 17) and refreshes, only their image shows.
- [ ] No TypeScript errors.
