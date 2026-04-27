# Task 03 — CSS Variable Theme System

**Dependencies**: Task 01 (themes.ts exists)  
**Files modified**: `app/globals.css`, `tailwind.config.ts`

---

## Problem

Tailwind generates static CSS at build time. The current `tailwind.config.ts` maps `brand-light` → `#FBA98E` directly. You cannot change these at runtime per user.

## Solution: CSS Custom Properties

By mapping Tailwind color tokens to CSS `var()` references, the browser resolves the actual color at runtime. The layout can then change the variable value on `<html>` and every component recolors automatically.

---

## globals.css Changes

Add default CSS variable declarations in `:root` (orange theme = default):

```css
:root {
  --brand-light:   #FBA98E;
  --brand-mid:     #F86A3A;
  --brand-strong:  #F64409;
  --surface:       #FFF8F6;
  --empty:         #F5EDE9;
  --border:        #F0E8E5;
  --border-strong: #E8D5CF;
}
```

---

## tailwind.config.ts Changes

Map all theme-able tokens to CSS variables:

```typescript
colors: {
  'brand-light':   'var(--brand-light)',
  'brand-mid':     'var(--brand-mid)',
  'brand-strong':  'var(--brand-strong)',
  'surface':       'var(--surface)',
  'border':        'var(--border)',
  'border-strong': 'var(--border-strong)',
  'app-text':      '#1A0A06',   // fixed — not theme-dependent
  'app-muted':     '#8A6560',   // fixed
  'empty':         'var(--empty)',
}
```

No component code changes needed — all existing `bg-brand-strong`, `text-brand-mid`, etc. classes continue to work and now pick up the CSS variable value.

---

## Runtime Theme Injection (app/layout.tsx)

```tsx
<html lang="en" style={{
  '--brand-light':   theme.c1,
  '--brand-mid':     theme.c2,
  '--brand-strong':  theme.c3,
  '--surface':       theme.surface,
  '--empty':         theme.empty,
  '--border':        theme.border,
  '--border-strong': theme.borderStrong,
} as React.CSSProperties}>
```

When no user is logged in, `:root` defaults apply (orange). When a user is logged in, the inline style on `<html>` overrides the variables.

---

## Verification

- [ ] Orange theme (default): UI looks identical to V1
- [ ] Red theme: header underline is red, heatmap cells show red shades, buttons are red
- [ ] Blue theme: header underline is blue, heatmap cells show blue shades
- [ ] Custom theme: color picker → selected color applied site-wide
- [ ] Switching theme from profile settings: reload → new colors appear
