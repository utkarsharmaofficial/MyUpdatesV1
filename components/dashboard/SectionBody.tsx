'use client'

import DailyTasks, { type Task } from '@/components/sections/DailyTasks'
import WorkoutSection from '@/components/sections/WorkoutSection'
import ExpensesSection from '@/components/sections/ExpensesSection'
import CustomSection from '@/components/sections/CustomSection'

interface Section {
  id: string
  type: 'workout' | 'expenses' | 'custom'
  name: string
  notes: string | null
  position: number
}

interface SectionBodyProps {
  activeId: string
  sections: Section[]
  initialTasks: Task[]
}

export default function SectionBody({ activeId, sections, initialTasks }: SectionBodyProps) {
  if (activeId === 'daily-tasks') {
    return <DailyTasks initialTasks={initialTasks} />
  }

  const section = sections.find(s => s.id === activeId)
  if (!section) return null

  if (section.type === 'workout') {
    return <WorkoutSection sectionId={section.id} sectionName={section.name} />
  }
  if (section.type === 'expenses') {
    return <ExpensesSection sectionId={section.id} sectionName={section.name} />
  }
  if (section.type === 'custom') {
    return (
      <CustomSection
        sectionId={section.id}
        sectionName={section.name}
        notes={section.notes ?? ''}
      />
    )
  }

  return null
}
