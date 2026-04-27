import type { Metadata } from 'next'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { resolveImages, resolveSongs } from '@/lib/utils'
import { DEFAULT_IMAGES, DEFAULT_SONGS } from '@/lib/defaults'
import Header from '@/components/layout/Header'
import Slideshow from '@/components/layout/Slideshow'
import MusicPlayer from '@/components/layout/MusicPlayer'

export const metadata: Metadata = {
  title: 'My Updates',
  description: 'Track your grind',
  icons: { icon: '/logo/HanumanJiLogo.jpeg' },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let imageUrls = DEFAULT_IMAGES
  let songs     = DEFAULT_SONGS

  if (user) {
    const { data: media } = await supabase
      .from('user_media')
      .select('*')
      .eq('user_id', user.id)

    // Generate 8-hour signed URLs so media displays correctly
    // whether the user-media bucket is public or private
    const mediaWithUrls = await Promise.all(
      (media ?? []).map(async (item) => {
        const { data } = await supabase.storage
          .from('user-media')
          .createSignedUrl(item.storage_path, 60 * 60 * 8)
        return { ...item, public_url: data?.signedUrl ?? item.public_url }
      })
    )

    imageUrls = resolveImages(mediaWithUrls)
    songs     = resolveSongs(mediaWithUrls)
  }

  return (
    <html lang="en">
      <body>
        <Header userEmail={user?.email ?? null} />

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
