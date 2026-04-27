'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentStreak, getLongestStreak, getTotalCount } from '@/lib/utils'
import StatCards from '@/components/shared/StatCards'
import HeatmapCalendar from '@/components/shared/HeatmapCalendar'

interface WorkoutSectionProps {
  sectionId: string
  sectionName: string
}

export default function WorkoutSection({ sectionId, sectionName }: WorkoutSectionProps) {
  const [entries, setEntries] = useState<Record<string, number>>({})

  const fetchAllEntries = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('entries')
      .select('entry_date, level')
      .eq('section_id', sectionId)

    const map: Record<string, number> = {}
    data?.forEach(r => { map[r.entry_date] = r.level })
    setEntries(map)
  }, [sectionId])

  useEffect(() => { fetchAllEntries() }, [fetchAllEntries])

  const cards: [
    { emoji: string; value: string | number; label: string },
    { emoji: string; value: string | number; label: string },
    { emoji: string; value: string | number; label: string },
  ] = [
    { emoji: '🔥', value: getCurrentStreak(entries),  label: 'Current Streak' },
    { emoji: '🏆', value: getLongestStreak(entries),  label: 'Longest Streak' },
    { emoji: '💪', value: getTotalCount(entries),     label: 'Total Workouts' },
  ]

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-base font-semibold text-app-text">{sectionName}</h3>
      <StatCards cards={cards} />
      <HeatmapCalendar
        sectionId={sectionId}
        type="workout"
        onEntryChange={fetchAllEntries}
      />
    </div>
  )
}
