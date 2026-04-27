'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  buildYearGrid,
  getMonthLabels,
  cellColour,
  nextLevel,
  getLevelFromAmount,
  toKey,
  today,
} from '@/lib/utils'
import ExpensePopup from './ExpensePopup'

interface HeatmapCalendarProps {
  sectionId: string
  type: 'workout' | 'expenses' | 'custom'
  onEntryChange?: () => void
}

// Monday-first: Mon(0) Tue(1) Wed(2) Thu(3) Fri(4) Sat(5) Sun(6)
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SHOWN_DAYS = new Set([0, 2, 4, 6]) // Mon, Wed, Fri, Sun

const CURRENT_YEAR = new Date().getFullYear()
const TODAY_KEY    = toKey(today())

export default function HeatmapCalendar({ sectionId, type, onEntryChange }: HeatmapCalendarProps) {
  const [year, setYear]               = useState(CURRENT_YEAR)
  const [entries, setEntries]         = useState<Record<string, number>>({})
  const [loading, setLoading]         = useState(true)
  const [popupDate, setPopupDate]     = useState<string | null>(null)
  const [popupAmount, setPopupAmount] = useState(0)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('entries')
      .select('entry_date, level, amount')
      .eq('section_id', sectionId)
      .gte('entry_date', `${year}-01-01`)
      .lte('entry_date', `${year}-12-31`)

    const map: Record<string, number> = {}
    for (const row of data ?? []) {
      const key = row.entry_date as string
      map[key] = type === 'expenses' ? (row.amount ?? 0) : (row.level ?? 0)
    }
    setEntries(map)
    setLoading(false)
  }, [sectionId, type, year])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  async function handleCellClick(dateKey: string) {
    if (dateKey > TODAY_KEY) return

    if (type === 'expenses') {
      setPopupDate(dateKey)
      setPopupAmount(entries[dateKey] ?? 0)
      return
    }

    const current  = entries[dateKey] ?? 0
    const newLevel = nextLevel(current)
    setEntries(prev => ({ ...prev, [dateKey]: newLevel }))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('entries').upsert({
      section_id: sectionId,
      user_id:    user.id,
      entry_date: dateKey,
      level:      newLevel,
      amount:     null,
    }, { onConflict: 'section_id,entry_date' })

    onEntryChange?.()
  }

  async function handleExpenseSave(amount: number) {
    if (!popupDate) return
    const level = getLevelFromAmount(amount)
    setEntries(prev => ({ ...prev, [popupDate]: amount }))
    setPopupDate(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('entries').upsert({
      section_id: sectionId,
      user_id:    user.id,
      entry_date: popupDate,
      level,
      amount,
    }, { onConflict: 'section_id,entry_date' })

    onEntryChange?.()
  }

  // Always render the full year so the grid is consistent across years.
  // Future cells are non-clickable (isFuture guard below).
  const weeks       = buildYearGrid(year)
  const monthLabels = getMonthLabels(weeks)

  const trackedCount = Object.values(entries).filter(v => v > 0).length
  const countLabel   = type === 'workout'
    ? `${trackedCount} workout${trackedCount !== 1 ? 's' : ''} this year`
    : `${trackedCount} day${trackedCount !== 1 ? 's' : ''} tracked this year`

  return (
    <div className="mt-3 bg-surface border border-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-app-muted">{countLabel}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setYear(y => y - 1)}
            className="text-app-muted hover:text-brand-strong text-sm w-5 text-center"
          >
            ‹
          </button>
          <span className="text-xs font-medium text-app-text w-10 text-center">{year}</span>
          <button
            onClick={() => setYear(y => y + 1)}
            disabled={year >= CURRENT_YEAR}
            className="text-app-muted hover:text-brand-strong text-sm w-5 text-center disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center text-xs text-app-muted">
          Loading…
        </div>
      ) : (
        <div className="w-full">
          <div className="flex gap-[2px] w-full">
            {/* Day labels column — fixed width, rows match cell height exactly */}
            <div className="flex flex-col gap-[2px] flex-shrink-0 w-7">
              <div style={{ height: 16 }} /> {/* spacer aligns with month label row */}
              {DAY_LABELS.map((label, i) => (
                <div
                  key={label}
                  style={{ height: 13, lineHeight: '13px' }}
                  className="text-[9px] text-app-muted flex items-center justify-end pr-0.5"
                >
                  {SHOWN_DAYS.has(i) ? label : ''}
                </div>
              ))}
            </div>

            {/* Week columns — each takes an equal share of available width */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px] flex-1 min-w-0">
                {/* Month label */}
                <div style={{ height: 16, lineHeight: '16px' }} className="text-[9px] text-app-muted overflow-hidden whitespace-nowrap">
                  {monthLabels[wi] ?? ''}
                </div>
                {/* Day cells — fixed height matches day label rows */}
                {week.map((date, di) => {
                  const key      = toKey(date)
                  const value    = entries[key] ?? 0
                  const level    = type === 'expenses'
                    ? getLevelFromAmount(value)
                    : value as 0 | 1 | 2 | 3
                  const isFuture = key > TODAY_KEY
                  const colour   = isFuture ? '#F5EDE9' : cellColour(level)

                  return (
                    <div
                      key={di}
                      title={`${key}${type === 'expenses' && value > 0 ? ` — ₹${value}` : ''}`}
                      onClick={() => !isFuture && handleCellClick(key)}
                      style={{
                        width:           '100%',
                        height:          13,
                        borderRadius:    3,
                        backgroundColor: colour,
                        cursor:          isFuture ? 'default' : 'pointer',
                      }}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend — bottom right, matching reference */}
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[10px] text-app-muted">Less</span>
        {([0, 1, 2, 3] as const).map(l => (
          <div
            key={l}
            style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: cellColour(l) }}
          />
        ))}
        <span className="text-[10px] text-app-muted">More</span>
      </div>

      {/* Expense popup */}
      {popupDate && (
        <ExpensePopup
          date={popupDate}
          currentAmount={popupAmount}
          onSave={handleExpenseSave}
          onClose={() => setPopupDate(null)}
        />
      )}
    </div>
  )
}
