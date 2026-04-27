'use client'

import { useState } from 'react'

interface ExpensePopupProps {
  date: string
  currentAmount: number
  onSave: (amount: number) => void
  onClose: () => void
}

export default function ExpensePopup({ date, currentAmount, onSave, onClose }: ExpensePopupProps) {
  const [amount, setAmount] = useState(currentAmount === 0 ? '' : String(currentAmount))

  function handleSave() {
    const parsed = parseFloat(amount)
    onSave(isNaN(parsed) || parsed < 0 ? 0 : parsed)
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-72 flex flex-col gap-4 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <p className="text-sm font-semibold text-app-text text-center">{date}</p>

        <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-2">
          <span className="text-app-muted text-sm">₹</span>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="flex-1 text-sm text-app-text focus:outline-none"
            autoFocus
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg bg-brand-strong text-white text-sm font-medium hover:bg-brand-mid transition-colors"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-border text-app-text text-sm hover:bg-surface transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
