# Final Checklist — V2 Implementation Verification

Run through this checklist after all 7 tasks are implemented and the app is running.

---

## Infrastructure

- [ ] `public/profiles/` contains 8 subdirectories (HanumanJi, GaneshaJi, KrishanJi, NavaratriSpecial, PremanandJi, RamJi, ShivaJi, Vrindavan)
- [ ] Each subdirectory has images + a logo file
- [ ] `public/profiles/HanumanJi/Songs/` has 3 .mp3 files
- [ ] `supabase/migration-v2.sql` run successfully in Supabase SQL Editor
- [ ] `profiles` table has columns: `selected_profile`, `theme_color`, `custom_theme_c1/c2/c3`, `onboarding_completed`
- [ ] `user_media` type constraint allows 'image', 'song', 'logo'

---

## Theme System

- [ ] `globals.css` has `:root { --brand-light: ...; --brand-mid: ...; --brand-strong: ...; }` defaults
- [ ] `tailwind.config.ts` maps `brand-light` → `var(--brand-light)` etc.
- [ ] Orange theme: UI looks identical to V1
- [ ] Red theme: header border, heatmap cells, buttons all use red shades
- [ ] Blue theme: header border, heatmap cells, buttons all use blue shades
- [ ] Custom theme: picked color appears throughout UI

---

## Onboarding Flow

- [ ] New user signup → after email confirmation / auto-confirm → lands on /onboarding
- [ ] /onboarding shows 2-step wizard: Profile → Theme
- [ ] Step 1: 9 cards visible (8 profiles + Custom)
- [ ] Each card shows profile logo + name
- [ ] Clicking a card highlights it with a ring
- [ ] Step 2: 4 swatches visible (Orange, Red, Blue, Custom)
- [ ] Each swatch shows color preview of 3 shades
- [ ] Clicking Custom shows color picker inline
- [ ] Finish button saves to DB (selected_profile, theme_color, onboarding_completed=true)
- [ ] After finish → redirected to /dashboard
- [ ] Visiting /onboarding after completion → redirected to /dashboard
- [ ] Unauthenticated /onboarding → redirected to /

---

## Profile Selection

- [ ] HanumanJi profile: HanumanJiLogo in header, HanumanJi images in slideshow, HanumanJi songs playing
- [ ] GaneshaJi profile: GaneshaLogo in header, Ganesha images in slideshow, default songs playing
- [ ] KrishanJi profile: KrishnaJiLogo in header, Krishna images in slideshow, default songs playing
- [ ] NavaratriSpecial profile: DeviMaaLogo in header, Navratri images in slideshow
- [ ] PremanandJi profile: PremanandJiLogo in header, Premanand Ji images in slideshow
- [ ] RamJi profile: RamLogo in header, Ram images in slideshow
- [ ] ShivaJi profile: ShivaLogo in header, Shiva images in slideshow
- [ ] Vrindavan profile: VrindavanLogo in header, Vrindavan images in slideshow

---

## Custom Profile

- [ ] Custom profile selected → logo in header = default (HanumanJi) until user uploads
- [ ] Profile page (custom selected) shows: Images panel, Songs panel, Logo panel
- [ ] Upload logo → logo appears in header (after reload)
- [ ] Remove logo → header shows default logo
- [ ] Upload images → slideshow shows user images
- [ ] Delete all images → slideshow shows HanumanJi defaults
- [ ] Upload songs → music player uses user songs
- [ ] Uploading 2nd logo replaces 1st (no duplicate DB rows)

---

## Profile Page Settings

- [ ] Profile page shows profile selector at top
- [ ] Profile page shows theme selector at top
- [ ] Current profile is highlighted (ring) when page loads
- [ ] Current theme is highlighted (ring) when page loads
- [ ] Save Changes → success message shown
- [ ] After reload, new profile/theme reflected in header and colors
- [ ] Non-custom profile → media upload panels hidden
- [ ] Custom profile → media upload panels shown

---

## Regression Checks

- [ ] Dashboard still loads with all sections intact
- [ ] Daily Tasks: add/complete/delete tasks still works
- [ ] Workout/Expenses/Custom sections: heatmap still works
- [ ] Add Section modal still works
- [ ] Remove section still works
- [ ] Sign out still works → redirected to /
- [ ] Sign in with existing account → reaches dashboard (if onboarded) or onboarding (if not)
- [ ] Music player: play/pause/prev/next/loop all work
- [ ] Slideshow: auto-cycles every 15s, dot indicators work
