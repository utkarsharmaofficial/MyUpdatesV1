-- Migration: add completion_note to tasks
-- Run in Supabase SQL Editor

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completion_note text;
