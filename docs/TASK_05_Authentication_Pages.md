# Task 05 — Authentication Pages

**Goal**: Build the login/register page at `/` and the logout action. A user should be able to create an account, sign in, and sign out. All error states must be shown inline.

**Prerequisites**: Task 04 (Supabase clients and middleware must be in place).

---

## Steps

### 1. Create `components/auth/AuthForm.tsx`
This is a Client Component (`'use client'`) that handles both modes (login and register) with a toggle.

**State needed:**
- `mode: 'login' | 'register'` — toggles which mode is active
- `email: string`, `password: string` — controlled inputs
- `loading: boolean` — disables the submit button while the request is in flight
- `error: string | null` — inline error message below the form

**Behaviour:**
- Register mode: calls `supabase.auth.signUp({ email, password })`. On success, show message: *"Account created! Check your email to confirm."* (Supabase sends a confirmation email by default). If email confirmation is disabled in Supabase settings, redirect to `/dashboard` directly.
- Login mode: calls `supabase.auth.signInWithPassword({ email, password })`. On success, redirect to `/dashboard` using `router.push('/dashboard')` from `next/navigation`.
- Error handling: catch the Supabase error message and display it in the `error` state below the form.
- Toggle: clicking "Don't have an account? Register" switches `mode` to `'register'` and clears the error.

**Visual design (Tailwind classes mapping the original palette):**
- White card centred on the page.
- Logo at the top (`/logo/HanumanJiLogo.jpeg`).
- Title: "My **Updates**" — "Updates" in `text-brand-strong`.
- Email + password inputs with `border-border` styling.
- Submit button: `bg-brand-strong text-white hover:bg-brand-mid`.
- Error message: red inline text below the submit button.
- Toggle link: `text-brand-strong underline`.

### 2. Create `app/page.tsx`
```typescript
import AuthForm from '@/components/auth/AuthForm'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <AuthForm />
    </main>
  )
}
```

### 3. Add logout action
The logout button lives in the Header (built in Task 06), but the logout function needs to be defined now for reference.

Create a Server Action in `app/actions.ts`:
```typescript
'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}
```

The Header component will call this action via a `<form action={signOut}>` with a submit button.

### 4. (Optional) Disable email confirmation for development
In Supabase dashboard: **Authentication → Settings → Email** → uncheck **"Enable email confirmations"**. This lets you sign up and immediately log in without checking email during development. Re-enable for production.

---

## Files Created / Modified

| File | Action |
|---|---|
| `components/auth/AuthForm.tsx` | Created — login/register form with error handling |
| `app/page.tsx` | Created — root page renders AuthForm |
| `app/actions.ts` | Created — signOut Server Action |

---

## Done When

- [ ] Visiting `localhost:3000/` shows the login/register form.
- [ ] Can register a new account (check Supabase **Authentication → Users** to confirm the user was created).
- [ ] After registration/login, browser redirects to `/dashboard` (which currently shows the placeholder from Task 01 — that is fine).
- [ ] Visiting `/` while already logged in redirects to `/dashboard` (middleware from Task 04).
- [ ] Entering wrong credentials shows an inline error (not a page crash).
- [ ] The `signOut` Server Action is exported from `app/actions.ts`.
