# Task 02 — Database Schema Migration

**Dependencies**: Task 01 complete  
**Files created**: `supabase/migration-v2.sql`  
**Action required**: Run SQL in Supabase SQL Editor

---

## SQL to Run

File: `supabase/migration-v2.sql`

```sql
-- ── V2 Migration: profiles table extensions ──────────────────

-- Add user preference columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS selected_profile      text    NOT NULL DEFAULT 'HanumanJi',
  ADD COLUMN IF NOT EXISTS theme_color           text    NOT NULL DEFAULT 'orange',
  ADD COLUMN IF NOT EXISTS custom_theme_c1       text,
  ADD COLUMN IF NOT EXISTS custom_theme_c2       text,
  ADD COLUMN IF NOT EXISTS custom_theme_c3       text,
  ADD COLUMN IF NOT EXISTS onboarding_completed  boolean NOT NULL DEFAULT false;

-- ── V2 Migration: user_media type extension ──────────────────

-- Extend type check to allow 'logo' uploads for custom profile
ALTER TABLE user_media DROP CONSTRAINT IF EXISTS user_media_type_check;
ALTER TABLE user_media ADD CONSTRAINT user_media_type_check
  CHECK (type IN ('image', 'song', 'logo'));
```

---

## Notes

- `IF NOT EXISTS` / `IF EXISTS` guards make this idempotent (safe to re-run).
- `DEFAULT 'HanumanJi'` and `DEFAULT 'orange'` ensure all existing users get the original experience without needing to go through onboarding.
- `onboarding_completed DEFAULT false` means existing users will be sent to onboarding on next login, unless you set it to `true` for them:
  ```sql
  -- Optional: mark all existing users as already onboarded
  UPDATE profiles SET onboarding_completed = true WHERE id IS NOT NULL;
  ```
- The `'logo'` type in `user_media` is only used when `selected_profile = 'custom'`. One logo per user (old logo is replaced on upload).

---

## Verification

- [ ] Run `SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles'` → shows `selected_profile`, `theme_color`, `custom_theme_c1/c2/c3`, `onboarding_completed`
- [ ] Run `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = 'user_media'` → constraint updated
- [ ] Try inserting a row with `type = 'logo'` → succeeds
- [ ] Try inserting with `type = 'invalid'` → fails with constraint error
