-- Task 03 — Storage RLS policy for user-media bucket
-- Run this in Supabase SQL Editor after creating the user-media bucket.
--
-- Users can read, upload, update, and delete only objects whose path
-- starts with their own user UUID (e.g. user-media/{uid}/images/photo.jpg).

CREATE POLICY "user owns their folder"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'user-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'user-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
