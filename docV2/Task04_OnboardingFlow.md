# Task 04 — Onboarding Flow

**Dependencies**: Tasks 01, 02, 03  
**Files created**: `app/onboarding/page.tsx`, `components/onboarding/OnboardingWizard.tsx`  
**Files modified**: `app/dashboard/page.tsx`, `app/actions.ts`, `middleware.ts`, `components/auth/AuthForm.tsx`

---

## User Journey

```
New user signs up
  → (if email auto-confirmed) session created, pushed to /dashboard
  → dashboard/page.tsx fetches profiles row, checks onboarding_completed
  → false → redirect('/onboarding')

Onboarding wizard:
  Step 1 — Choose Profile (9 cards in a grid)
    [Hanuman Ji] [Ganesha Ji] [Krishan Ji] [Navratri Special]
    [Premanand Ji] [Ram Ji] [Shiva Ji] [Vrindavan] [Custom ✏️]
    → click a card → selectedProfile state updates → highlight card
    → Next button becomes active

  Step 2 — Choose Theme (4 swatches)
    [🟠 Orange]  [🔴 Red]  [🔵 Blue]  [🎨 Custom]
    Custom option shows an <input type="color"> picker inline
    → click a swatch → selectedTheme state updates
    → live preview: a small sample bar shows the 3 shades

  Finish button:
    → calls saveOnboardingPreferences(selectedProfile, selectedTheme, customColor)
    → server action: UPDATE profiles SET ... WHERE id = auth.uid()
    → router.push('/dashboard')
```

---

## app/onboarding/page.tsx (Server Component)

```typescript
export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles').select('onboarding_completed').eq('id', user.id).single()
  if (profile?.onboarding_completed) redirect('/dashboard')

  return <OnboardingWizard />
}
```

---

## components/onboarding/OnboardingWizard.tsx (Client Component)

State:
- `step: 1 | 2`
- `selectedProfile: string` (default 'HanumanJi')
- `selectedTheme: string` (default 'orange')
- `customColor: string` (default '#FF6600')

Step 1 UI: Grid of profile cards, each showing:
- Profile logo image (40×40px, rounded)
- Profile name label
- Checked ring when selected

Step 2 UI: Row of 4 theme swatches:
- Circle showing c1/c2/c3 gradient
- Name label below
- For Custom: inline color picker below the swatch

---

## saveOnboardingPreferences (app/actions.ts)

New server action:

```typescript
export async function saveOnboardingPreferences(
  selectedProfile: string,
  themeColor: string,
  customC1?: string,
  customC2?: string,
  customC3?: string,
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('profiles').update({
    selected_profile: selectedProfile,
    theme_color: themeColor,
    custom_theme_c1: customC1 ?? null,
    custom_theme_c2: customC2 ?? null,
    custom_theme_c3: customC3 ?? null,
    onboarding_completed: true,
  }).eq('id', user.id)
}
```

---

## middleware.ts Changes

Add `/onboarding` to the list of routes protected from unauthenticated access (it redirects to `/` if no session). Also update the matcher to allow static asset files (mp3, ogg, m4a) to bypass middleware:

```typescript
// matcher update — also exclude audio files
'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|ogg|m4a)$).*)'

// route protection
if (!user && (pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/onboarding'))) {
  redirect('/')
}
// If authenticated and visiting /, let dashboard/page.tsx handle onboarding check
// (don't redirect to /onboarding from middleware — too expensive to query DB here)
```

---

## AuthForm.tsx Changes

After `signUp`, if a session is returned (auto-confirmed), push to `/dashboard`:

```typescript
const { data, error } = await supabase.auth.signUp({ email, password })
if (error) { setError(error.message) }
else if (data.session) { router.push('/dashboard') }  // auto-login
else { setSuccess('Account created! Check your email to confirm.') }
```

---

## Verification

- [ ] New signup → reaches /onboarding wizard
- [ ] Step 1: clicking each profile card highlights it
- [ ] Step 2: clicking each theme swatch shows live color preview
- [ ] Clicking Custom swatch → color picker appears
- [ ] Finish → redirected to /dashboard
- [ ] Revisiting /onboarding after completion → redirected to /dashboard
- [ ] Unauthenticated /onboarding → redirected to /
