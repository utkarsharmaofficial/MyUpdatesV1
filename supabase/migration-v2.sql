-- ============================================================
-- MyUpdatesV1 — V2 Migration
-- Run in Supabase SQL Editor
-- ============================================================

-- ── 1. Extend profiles table with user preferences ───────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS selected_profile     text    NOT NULL DEFAULT 'HanumanJi',
  ADD COLUMN IF NOT EXISTS theme_color          text    NOT NULL DEFAULT 'orange',
  ADD COLUMN IF NOT EXISTS custom_theme_c1      text,
  ADD COLUMN IF NOT EXISTS custom_theme_c2      text,
  ADD COLUMN IF NOT EXISTS custom_theme_c3      text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;


-- ── 2. Extend user_media to support logo uploads ─────────────

ALTER TABLE user_media DROP CONSTRAINT IF EXISTS user_media_type_check;

ALTER TABLE user_media
  ADD CONSTRAINT user_media_type_check
  CHECK (type IN ('image', 'song', 'logo'));


-- ── 3. (Optional) Mark all existing users as already onboarded ─
-- Remove the "--" prefix below if you want existing users to skip onboarding
-- UPDATE profiles SET onboarding_completed = true;
