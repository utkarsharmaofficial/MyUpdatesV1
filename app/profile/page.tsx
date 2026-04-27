import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfilePage from '@/components/profile/ProfilePage'
import { type UserMediaItem, type UserProfile } from '@/lib/utils'

export default async function Profile() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const [{ data: media }, { data: profileRow }] = await Promise.all([
    supabase
      .from('user_media')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('profiles')
      .select('selected_profile, theme_color, custom_theme_c1, custom_theme_c2, custom_theme_c3')
      .eq('id', user.id)
      .single(),
  ])

  // Generate signed URLs for display
  const mediaWithUrls: UserMediaItem[] = await Promise.all(
    (media ?? []).map(async (item) => {
      const { data } = await supabase.storage
        .from('user-media')
        .createSignedUrl(item.storage_path, 60 * 60)
      return { ...item, display_url: data?.signedUrl ?? item.public_url } as UserMediaItem
    })
  )

  const userProfile: UserProfile = profileRow ?? {
    selected_profile: 'HanumanJi',
    theme_color:      'orange',
    custom_theme_c1:  null,
    custom_theme_c2:  null,
    custom_theme_c3:  null,
  }

  return (
    <ProfilePage
      initialMedia={mediaWithUrls}
      userId={user.id}
      userProfile={userProfile}
    />
  )
}
