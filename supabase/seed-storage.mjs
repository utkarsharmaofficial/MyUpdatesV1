/**
 * Task 03 — Storage seeding script
 * Creates the defaults + user-media buckets and uploads all default media.
 *
 * Run from the project root:
 *   node --env-file=.env.local supabase/seed-storage.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL          = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const MIME = {
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.mp3':  'audio/mpeg',
}

async function ensureBucket(name, isPublic, fileSizeMb) {
  const { data: existing } = await supabase.storage.getBucket(name)
  if (existing) {
    console.log(`  Bucket "${name}" already exists — skipping creation`)
    return
  }
  const { error } = await supabase.storage.createBucket(name, {
    public: isPublic,
    fileSizeLimit: fileSizeMb * 1024 * 1024,
  })
  if (error) throw new Error(`Failed to create bucket "${name}": ${error.message}`)
  console.log(`  Created bucket "${name}" (public=${isPublic})`)
}

async function uploadFile(bucket, storagePath, localPath) {
  const ext = extname(localPath).toLowerCase()
  const contentType = MIME[ext] ?? 'application/octet-stream'
  const fileBuffer = readFileSync(localPath)

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, { contentType, upsert: true })

  if (error) throw new Error(`Upload failed for ${storagePath}: ${error.message}`)
  console.log(`  Uploaded: ${storagePath}`)
}

async function main() {
  console.log('\n── Creating buckets ────────────────────────────')
  await ensureBucket('defaults',   true,  50)
  await ensureBucket('user-media', false, 20)

  const imagesDir = '/Users/utkarsh/Desktop/Code/MyUpdates/Images'
  const songsDir  = '/Users/utkarsh/Desktop/Code/MyUpdates/Bhajan'

  console.log('\n── Uploading default images ────────────────────')
  const images = readdirSync(imagesDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f))
  for (const file of images) {
    await uploadFile('defaults', `images/${file}`, join(imagesDir, file))
  }

  console.log('\n── Uploading default songs ─────────────────────')
  const songs = readdirSync(songsDir).filter(f => /\.mp3$/i.test(f))
  for (const file of songs) {
    await uploadFile('defaults', `songs/${file}`, join(songsDir, file))
  }

  console.log('\n✓ Storage seed complete\n')
}

main().catch(err => { console.error(err); process.exit(1) })
