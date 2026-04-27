import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { toKey, today } from '@/lib/utils'
import Dashboard from '@/components/dashboard/Dashboard'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Check onboarding status — redirect new users to the setup wizard
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const [{ data: sections }, { data: tasks }] = await Promise.all([
    supabase.from('sections').select('*').eq('user_id', user.id).order('position'),
    supabase.from('tasks').select('*').eq('user_id', user.id).eq('task_date', toKey(today())),
  ])

  return (
    <Dashboard
      initialSections={sections ?? []}
      initialTasks={tasks ?? []}
    />
  )
}
