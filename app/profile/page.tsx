import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfilePage from '@/components/profile/ProfilePage'
import { type UserMediaItem } from '@/lib/utils'

export default async function Profile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: media } = await supabase
    .from('user_media')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // Generate 1-hour signed URLs for display (works whether bucket is public or private)
  const mediaWithUrls: UserMediaItem[] = await Promise.all(
    (media ?? []).map(async (item) => {
      const { data } = await supabase.storage
        .from('user-media')
        .createSignedUrl(item.storage_path, 60 * 60)
      return { ...item, display_url: data?.signedUrl ?? item.public_url }
    })
  )

  return <ProfilePage initialMedia={mediaWithUrls} userId={user.id} />
}
