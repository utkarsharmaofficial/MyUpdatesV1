# Task 01 — Project Setup & Folder Structure

**Goal**: Scaffold the Next.js 14 project with TypeScript, configure Tailwind CSS with the exact colour tokens from the original app, and create the full folder structure so every subsequent task knows exactly where to put its files.

**Prerequisites**: None. This is the first task.

---

## Steps

### 1. Scaffold the Next.js project
Inside `/Users/utkarsh/Desktop/Code/`, run:
```bash
npx create-next-app@14 MyUpdatesV1 \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=no \
  --import-alias="@/*"
```
When prompted:
- Use App Router: **Yes**
- Customise default import alias: **Yes** → `@/*`

### 2. Install additional dependencies
```bash
cd MyUpdatesV1
npm install @supabase/supabase-js @supabase/ssr
```

### 3. Configure Tailwind with brand colour tokens
Open `tailwind.config.ts` and replace the `theme.extend` block with:
```typescript
theme: {
  extend: {
    colors: {
      'brand-light':    '#FBA98E',
      'brand-mid':      '#F86A3A',
      'brand-strong':   '#F64409',
      'surface':        '#FFF8F6',
      'border':         '#F0E8E5',
      'border-strong':  '#E8D5CF',
      'app-text':       '#1A0A06',
      'app-muted':      '#8A6560',
      'empty':          '#F5EDE9',
    },
    fontFamily: {
      sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
  },
},
```

### 4. Replace `app/globals.css` content
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #FFFFFF;
  color: #1A0A06;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
  padding-bottom: 90px; /* space for fixed music player */
}
```

### 5. Create the folder structure
Create all required folders (files will be added in later tasks):
```
app/
  dashboard/
  profile/
  api/
    sections/
      [id]/
    entries/
    tasks/
      [id]/
    media/
      [id]/

components/
  auth/
  layout/
  dashboard/
  sections/
  shared/

lib/
  supabase/

public/
  logo/
```

### 6. Copy the logo
Copy `HanumanJiLogo.jpeg` from the original `MyUpdates/logo/` into `MyUpdatesV1/public/logo/HanumanJiLogo.jpeg`.

### 7. Create `.env.local.example`
```bash
# Supabase — copy from your Supabase project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Service role key — server-side only, NEVER prefix with NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```
Add `.env.local` (without the `.example` suffix) to `.gitignore`.

### 8. Create `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

module.exports = nextConfig
```
This allows Next.js `<Image>` to load files from Supabase Storage CDN URLs.

### 9. Verify ESLint config
Ensure `.eslintrc.json` exists with at minimum:
```json
{
  "extends": "next/core-web-vitals"
}
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `tailwind.config.ts` | Modified — brand colour tokens added |
| `app/globals.css` | Modified — base styles matching original |
| `next.config.js` | Created — Supabase image domain allowed |
| `.env.local.example` | Created — env var template |
| `.gitignore` | Modified — `.env.local` entry confirmed |
| `public/logo/HanumanJiLogo.jpeg` | Created — copied from original app |
| All empty folders (`components/`, `lib/`, etc.) | Created |

---

## Done When

- [ ] `npm run dev` starts with no errors and opens `localhost:3000`.
- [ ] The default Next.js page loads (will be replaced in Task 05).
- [ ] `tailwind.config.ts` contains all 9 brand colour tokens.
- [ ] `.env.local.example` exists and `.env.local` is in `.gitignore`.
- [ ] All folders listed in ARCHITECTURE.md section 13 exist.
