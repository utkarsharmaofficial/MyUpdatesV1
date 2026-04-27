'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDailyAmount, getMonthlyTotal, getYearlyTotal } from '@/lib/utils'
import StatCards from '@/components/shared/StatCards'
import HeatmapCalendar from '@/components/shared/HeatmapCalendar'

interface ExpensesSectionProps {
  sectionId: string
  sectionName: string
}

export default function ExpensesSection({ sectionId, sectionName }: ExpensesSectionProps) {
  const [entries, setEntries] = useState<Record<string, number>>({})

  const fetchAllEntries = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('entries')
      .select('entry_date, amount')
      .eq('section_id', sectionId)

    const map: Record<string, number> = {}
    data?.forEach(r => { map[r.entry_date] = r.amount ?? 0 })
    setEntries(map)
  }, [sectionId])

  useEffect(() => { fetchAllEntries() }, [fetchAllEntries])

  const cards: [
    { emoji: string; value: string | number; label: string },
    { emoji: string; value: string | number; label: string },
    { emoji: string; value: string | number; label: string },
  ] = [
    { emoji: '💸', value: `₹${getDailyAmount(entries)}`,  label: 'Daily Spending'   },
    { emoji: '📅', value: `₹${getMonthlyTotal(entries)}`, label: 'Monthly Spending' },
    { emoji: '📊', value: `₹${getYearlyTotal(entries)}`,  label: 'Yearly Spending'  },
  ]

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-base font-semibold text-app-text">{sectionName}</h3>
      <StatCards cards={cards} />
      <HeatmapCalendar
        sectionId={sectionId}
        type="expenses"
        onEntryChange={fetchAllEntries}
      />
    </div>
  )
}
