# Task 02 — Supabase Project & Database Schema

**Goal**: Create the Supabase project, run all SQL to create the 5 tables, enable Row-Level Security with the correct policies, and add the 3 enforcement triggers (section limit, image limit, song limit) plus the auto-profile trigger.

**Prerequisites**: Task 01 (project must exist so you know the env var values to copy).

---

## Steps

### 1. Create the Supabase project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Name: `MyUpdatesV1`, region: closest to you, set a strong database password.
4. Wait for the project to finish provisioning (~60 seconds).
5. Go to **Settings → API**. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY`
6. Paste all three into your `.env.local` file.

### 2. Open the SQL Editor
In your Supabase dashboard: **SQL Editor → New query**.

Run each SQL block below as a separate query (or all in one — order matters).

### 3. Create the `profiles` table
```sql
CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);
```

### 4. Create the auto-profile trigger
Every time a user signs up, this trigger creates their `profiles` row automatically:
```sql
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
```

### 5. Create the `sections` table
```sql
CREATE TABLE sections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('workout', 'expenses', 'custom')),
  name        text NOT NULL,
  notes       text,
  position    int  NOT NULL DEFAULT 1,
  created_at  timestamptz DEFAULT now()
);
```

### 6. Create the `entries` table
```sql
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
```

### 7. Create the `tasks` table
```sql
CREATE TABLE tasks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text        text NOT NULL,
  completed   boolean NOT NULL DEFAULT false,
  task_date   date NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz DEFAULT now()
);
```

### 8. Create the `user_media` table
```sql
CREATE TABLE user_media (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          text NOT NULL CHECK (type IN ('image', 'song')),
  storage_path  text NOT NULL,
  public_url    text NOT NULL,
  display_name  text NOT NULL,
  created_at    timestamptz DEFAULT now()
);
```

### 9. Enable Row-Level Security on all tables
```sql
ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections   ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_media ENABLE ROW LEVEL SECURITY;
```

### 10. Create RLS policies
```sql
-- profiles: users can only see/edit their own row
CREATE POLICY "own profile"
  ON profiles FOR ALL
  USING (id = auth.uid());

-- sections: users can only see/edit their own sections
CREATE POLICY "own sections"
  ON sections FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- entries: users can only see/edit their own entries
CREATE POLICY "own entries"
  ON entries FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- tasks: users can only see/edit their own tasks
CREATE POLICY "own tasks"
  ON tasks FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- user_media: users can only see/edit their own media records
CREATE POLICY "own media"
  ON user_media FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### 11. Create the section limit trigger (max 3 per user)
```sql
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
```

### 12. Create the image limit trigger (max 10 per user)
```sql
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
```

### 13. Create the song limit trigger (max 5 per user)
```sql
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
```

---

## Files Created / Modified

| File | Action |
|---|---|
| `.env.local` | Modified — Supabase URL + keys added |
| Supabase project SQL (no local files) | 5 tables, 5 RLS policies, 4 triggers created in Supabase dashboard |

---

## Done When

- [ ] All 5 tables visible in Supabase **Table Editor**: `profiles`, `sections`, `entries`, `tasks`, `user_media`.
- [ ] Each table shows the **RLS enabled** badge in the Table Editor.
- [ ] Each table shows at least one policy in **Authentication → Policies**.
- [ ] Can manually insert a test row into `profiles` (using the Supabase SQL editor with a known `auth.uid()`) and retrieve it via the anon key.
- [ ] Manually inserting a 4th section for the same user_id raises an exception in the SQL editor.
- [ ] Manually inserting an 11th image row for the same user_id raises an exception.
- [ ] Manually inserting a 6th song row for the same user_id raises an exception.
- [ ] `.env.local` has all three Supabase keys filled in.
