import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import {
  resolveImages,
  resolveSongs,
  resolveLogoPath,
  resolveTheme,
  type UserProfile,
  type UserMediaItem,
} from '@/lib/utils'
import { DEFAULT_IMAGES, DEFAULT_SONGS } from '@/lib/defaults'
import Header from '@/components/layout/Header'
import Slideshow from '@/components/layout/Slideshow'
import MusicPlayer from '@/components/layout/MusicPlayer'

export const metadata: Metadata = {
  title: 'My Updates',
  description: 'Track your grind',
  icons: { icon: 'https://hxdjonkahanjqtuwvusn.supabase.co/storage/v1/object/public/defaults/favicon.png' },
}

const DEFAULT_PROFILE: UserProfile = {
  selected_profile: 'HanumanJi',
  theme_color:      'orange',
  custom_theme_c1:  null,
  custom_theme_c2:  null,
  custom_theme_c3:  null,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userProfile: UserProfile = DEFAULT_PROFILE
  let userMedia:   UserMediaItem[] = []
  let imageUrls = DEFAULT_IMAGES
  let songs     = DEFAULT_SONGS
  let logoSrc   = 'https://hxdjonkahanjqtuwvusn.supabase.co/storage/v1/object/public/defaults/logo/HanumanJiLogo.jpeg'

  if (user) {
    // Fetch user profile preferences
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('selected_profile, theme_color, custom_theme_c1, custom_theme_c2, custom_theme_c3')
      .eq('id', user.id)
      .single()

    if (profileRow) userProfile = profileRow as UserProfile

    // Only fetch user_media for custom profile (images, songs, logo)
    if (userProfile.selected_profile === 'custom') {
      const { data: media } = await supabase
        .from('user_media')
        .select('*')
        .eq('user_id', user.id)

      userMedia = await Promise.all(
        (media ?? []).map(async (item) => {
          const { data } = await supabase.storage
            .from('user-media')
            .createSignedUrl(item.storage_path, 60 * 60 * 8)
          return { ...item, display_url: data?.signedUrl ?? item.public_url } as UserMediaItem
        })
      )
    }

    imageUrls = resolveImages(userProfile, userMedia)
    songs     = resolveSongs(userProfile, userMedia)
    logoSrc   = resolveLogoPath(userProfile, userMedia)
  }

  const theme = resolveTheme(userProfile)

  return (
    <html
      lang="en"
      style={{
        '--brand-light':   theme.c1,
        '--brand-mid':     theme.c2,
        '--brand-strong':  theme.c3,
        '--surface':       theme.surface,
        '--empty':         theme.empty,
        '--border':        theme.border,
        '--border-strong': theme.borderStrong,
      } as React.CSSProperties}
    >
      <body>
        <Header userEmail={user?.email ?? null} logoSrc={logoSrc} />

        <div className="page-layout">
          <div className="image-panel">
            <Slideshow imageUrls={imageUrls} />
          </div>
          <div className="right-column">
            {children}
          </div>
        </div>

        <MusicPlayer songs={songs} />
      </body>
    </html>
  )
}
