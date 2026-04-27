import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) redirect('/dashboard')

  return (
    <main className="min-h-screen flex items-center justify-center bg-white p-4">
      <OnboardingWizard />
    </main>
  )
}
