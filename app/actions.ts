'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function saveOnboardingPreferences(
  selectedProfile: string,
  themeColor: string,
  customC1?: string,
  customC2?: string,
  customC3?: string,
) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      selected_profile:    selectedProfile,
      theme_color:         themeColor,
      custom_theme_c1:     customC1 ?? null,
      custom_theme_c2:     customC2 ?? null,
      custom_theme_c3:     customC3 ?? null,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { ok: true }
}
