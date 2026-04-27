-- ============================================================
-- MyUpdatesV1 — Full Database Schema
-- Run this entire file in Supabase SQL Editor (one query)
-- ============================================================


-- ── 1. profiles ─────────────────────────────────────────────
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);


-- ── 2. Auto-profile trigger ──────────────────────────────────
-- Creates a profiles row automatically whenever a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 3. sections ──────────────────────────────────────────────
CREATE TABLE sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('workout', 'expenses', 'custom')),
  name        text NOT NULL,
  notes       text,
  position    int  NOT NULL DEFAULT 1,
  created_at  timestamptz DEFAULT now()
);


-- ── 4. entries ───────────────────────────────────────────────
CREATE TABLE entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id  uuid NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date  date NOT NULL,
  level       int  CHECK (level BETWEEN 0 AND 3),
  amount      numeric CHECK (amount >= 0),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (section_id, entry_date)
);


-- ── 5. tasks ─────────────────────────────────────────────────
CREATE TABLE tasks (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text             text NOT NULL,
  completed        boolean NOT NULL DEFAULT false,
  completion_note  text,
  task_date        date NOT NULL DEFAULT CURRENT_DATE,
  created_at       timestamptz DEFAULT now()
);


-- ── 6. user_media ────────────────────────────────────────────
CREATE TABLE user_media (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('image', 'song')),
  storage_path  text NOT NULL,
  public_url    text NOT NULL,
  display_name  text NOT NULL,
  created_at    timestamptz DEFAULT now()
);


-- ── 7. Enable Row-Level Security ─────────────────────────────
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_media ENABLE ROW LEVEL SECURITY;


-- ── 8. RLS policies ──────────────────────────────────────────
CREATE POLICY "own profile"
  ON profiles FOR ALL
  USING (id = auth.uid());

CREATE POLICY "own sections"
  ON sections FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "own entries"
  ON entries FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "own tasks"
  ON tasks FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "own media"
  ON user_media FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- ── 9. Section limit trigger (max 3 per user) ────────────────
CREATE OR REPLACE FUNCTION check_section_limit()
RETURNS trigger AS $$
BEGIN
  IF (SELECT COUNT(*) FROM sections WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Section limit reached (max 3)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_section_limit
  BEFORE INSERT ON sections
  FOR EACH ROW EXECUTE FUNCTION check_section_limit();


-- ── 10. Image limit trigger (max 10 per user) ────────────────
CREATE OR REPLACE FUNCTION check_image_limit()
RETURNS trigger AS $$
BEGIN
  IF NEW.type = 'image' AND
     (SELECT COUNT(*) FROM user_media
      WHERE user_id = NEW.user_id AND type = 'image') >= 10 THEN
    RAISE EXCEPTION 'Image limit reached (max 10)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_image_limit
  BEFORE INSERT ON user_media
  FOR EACH ROW EXECUTE FUNCTION check_image_limit();


-- ── 11. Song limit trigger (max 5 per user) ──────────────────
CREATE OR REPLACE FUNCTION check_song_limit()
RETURNS trigger AS $$
BEGIN
  IF NEW.type = 'song' AND
     (SELECT COUNT(*) FROM user_media
      WHERE user_id = NEW.user_id AND type = 'song') >= 5 THEN
    RAISE EXCEPTION 'Song limit reached (max 5)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_song_limit
  BEFORE INSERT ON user_media
  FOR EACH ROW EXECUTE FUNCTION check_song_limit();
