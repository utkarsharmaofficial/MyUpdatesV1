'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NavBar from './NavBar'
import SectionBody from './SectionBody'
import AddSectionModal from './AddSectionModal'
import { type Task } from '@/components/sections/DailyTasks'

interface Section {
  id: string
  type: 'workout' | 'expenses' | 'custom'
  name: string
  notes: string | null
  position: number
}

interface DashboardProps {
  initialSections: Section[]
  initialTasks: Task[]
}

export default function Dashboard({ initialSections, initialTasks }: DashboardProps) {
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [activeId, setActiveId] = useState<string>('daily-tasks')
  const [modalOpen, setModalOpen] = useState(false)

  async function handleRemoveSection(id: string) {
    const section = sections.find(s => s.id === id)
    if (!section) return

    const confirmed = window.confirm(
      `Remove "${section.name}"? All recorded data will be permanently deleted.`
    )
    if (!confirmed) return

    const supabase = createClient()
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', id)

    if (error) {
      alert(`Failed to remove section: ${error.message}`)
      return
    }

    setSections(prev => prev.filter(s => s.id !== id))
    if (activeId === id) setActiveId('daily-tasks')
  }

  function handleSectionAdded(newSection: Section) {
    setSections(prev => [...prev, newSection])
    setActiveId(newSection.id)
    setModalOpen(false)
  }

  return (
    <>
      <NavBar
        sections={sections}
        activeId={activeId}
        onTabChange={setActiveId}
        onAddSectionClick={() => setModalOpen(true)}
        onRemoveSection={handleRemoveSection}
        canAddMore={sections.length < 3}
      />

      <div className="pt-6">
        <SectionBody
          activeId={activeId}
          sections={sections}
          initialTasks={initialTasks}
        />
      </div>

      {modalOpen && (
        <AddSectionModal
          onClose={() => setModalOpen(false)}
          onSectionAdded={handleSectionAdded}
          sectionsCount={sections.length}
        />
      )}
    </>
  )
}
