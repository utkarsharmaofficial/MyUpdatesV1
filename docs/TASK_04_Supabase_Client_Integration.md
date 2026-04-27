# Task 04 — Supabase Client Integration & Middleware

**Goal**: Wire the Supabase SDK into the Next.js project. Create the browser client, the server client, and the middleware that refreshes sessions and protects routes.

**Prerequisites**: Task 01 (project scaffolded), Task 02 (Supabase project exists and `.env.local` has keys).

---

## Steps

### 1. Confirm dependencies are installed
These were installed in Task 01. Verify:
```bash
npm list @supabase/supabase-js @supabase/ssr
```
Both packages must be present. If missing, run:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. Create `lib/supabase/client.ts` — Browser client
Used inside Client Components (`'use client'`) to make authenticated calls from the browser:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 3. Create `lib/supabase/server.ts` — Server client
Used inside Server Components, API Routes, and middleware. Reads the session from cookies so the server always has the correct user context:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll called from a Server Component — cookies can't be mutated here.
            // Middleware handles the session refresh instead.
          }
        },
      },
    }
  )
}
```

### 4. Create `middleware.ts` — Session refresh + route protection
Place this file at the project root (same level as `app/`):
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired — IMPORTANT: do not remove this call
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protect /dashboard and /profile — redirect to / if not authenticated
  if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/profile'))) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated and visiting /, redirect to /dashboard
  if (user && pathname === '/') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `lib/supabase/client.ts` | Created — browser Supabase client |
| `lib/supabase/server.ts` | Created — server Supabase client (cookie-based) |
| `middleware.ts` | Created — session refresh + route protection |

---

## Done When

- [ ] `lib/supabase/client.ts` exists and exports `createClient`.
- [ ] `lib/supabase/server.ts` exists and exports `createClient`.
- [ ] `middleware.ts` exists at the project root.
- [ ] Visiting `localhost:3000/dashboard` when not logged in redirects to `localhost:3000/`.
- [ ] No TypeScript errors in these three files (`npm run build` or `npx tsc --noEmit`).
