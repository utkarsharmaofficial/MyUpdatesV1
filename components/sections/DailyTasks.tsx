'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toKey, today } from '@/lib/utils'

export interface Task {
  id: string
  text: string
  completed: boolean
  completion_note: string | null
  task_date: string
  created_at: string
}

interface DailyTasksProps {
  initialTasks: Task[]
}

interface CompletionModal {
  taskId: string
  taskText: string
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

function formatDate(d: Date): string {
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export default function DailyTasks({ initialTasks }: DailyTasksProps) {
  const [activeTasks, setActiveTasks]       = useState<Task[]>(initialTasks.filter(t => !t.completed))
  const [completedTasks, setCompletedTasks] = useState<Task[]>(initialTasks.filter(t => t.completed))
  const [newTaskText, setNewTaskText]       = useState('')
  const [adding, setAdding]                 = useState(false)
  const [completedOpen, setCompletedOpen]   = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [modal, setModal]                   = useState<CompletionModal | null>(null)
  const [completionNote, setCompletionNote] = useState('')

  const todayDate = today()

  async function handleAddTask() {
    const text = newTaskText.trim()
    if (!text) return
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('tasks')
      .insert({ text, task_date: toKey(todayDate), user_id: user.id })
      .select()
      .single()

    if (!error && data) {
      setActiveTasks(prev => [data as Task, ...prev])
      setNewTaskText('')
      setAdding(false)
    }
    setSaving(false)
  }

  function openCompletionModal(task: Task) {
    setModal({ taskId: task.id, taskText: task.text })
    setCompletionNote('')
  }

  async function handleComplete() {
    if (!modal || !completionNote.trim()) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('tasks')
      .update({ completed: true, completion_note: completionNote.trim() })
      .eq('id', modal.taskId)

    if (!error) {
      const task = activeTasks.find(t => t.id === modal.taskId)
      if (task) {
        setActiveTasks(prev => prev.filter(t => t.id !== modal.taskId))
        setCompletedTasks(prev => [
          { ...task, completed: true, completion_note: completionNote.trim() },
          ...prev,
        ])
        if (!completedOpen) setCompletedOpen(true)
      }
    }

    setModal(null)
    setCompletionNote('')
    setSaving(false)
  }

  function handleAddKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAddTask()
    if (e.key === 'Escape') { setAdding(false); setNewTaskText('') }
  }

  function handleModalKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && e.ctrlKey) handleComplete()
    if (e.key === 'Escape') setModal(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-app-text">✅ Daily Tasks</h2>
        <span className="text-xs text-app-muted">{formatDate(todayDate)}</span>
      </div>

      {/* Active Tasks */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-medium text-app-muted uppercase tracking-wide mb-1">
          Active Tasks
        </p>

        {activeTasks.map(task => (
          <div
            key={task.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface border border-border hover:bg-empty transition-colors"
          >
            <button
              onClick={() => openCompletionModal(task)}
              className="w-5 h-5 rounded-full border-2 border-border-strong flex-shrink-0 hover:border-brand-strong transition-colors"
              title="Mark complete"
            />
            <span className="text-sm text-app-text">{task.text}</span>
          </div>
        ))}

        {/* Add task card */}
        {adding ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface border border-brand-mid">
            <input
              autoFocus
              type="text"
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              onKeyDown={handleAddKeyDown}
              placeholder="Task description…"
              className="flex-1 text-sm text-app-text bg-transparent focus:outline-none"
            />
            <button
              onClick={handleAddTask}
              disabled={saving || !newTaskText.trim()}
              className="text-xs font-medium text-white bg-brand-strong px-3 py-1 rounded-lg hover:bg-brand-mid transition-colors disabled:opacity-50"
            >
              Add
            </button>
            <button
              onClick={() => { setAdding(false); setNewTaskText('') }}
              className="text-xs text-app-muted hover:text-app-text"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border text-app-muted text-sm hover:border-brand-mid hover:text-brand-mid transition-colors"
          >
            <span className="text-base leading-none">+</span>
            Add Task
          </button>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setCompletedOpen(o => !o)}
            className="flex items-center gap-1 text-xs font-medium text-app-muted uppercase tracking-wide mb-1 hover:text-app-text transition-colors"
          >
            <span>{completedOpen ? '▾' : '▸'}</span>
            Completed ({completedTasks.length})
          </button>

          {completedOpen && completedTasks.map(task => (
            <div
              key={task.id}
              className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-empty border border-border opacity-70"
            >
              <div className="w-5 h-5 rounded-full bg-brand-light flex-shrink-0 flex items-center justify-center mt-0.5">
                <span className="text-[10px] text-white">✓</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm text-app-muted line-through">{task.text}</span>
                {task.completion_note && (
                  <span className="text-xs text-app-muted mt-0.5 italic">
                    {task.completion_note}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Completion modal */}
      {modal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <div className="bg-white rounded-2xl p-6 w-80 flex flex-col gap-4 shadow-xl">
            <div>
              <p className="text-xs text-app-muted mb-1">Completing</p>
              <p className="text-sm font-semibold text-app-text">{modal.taskText}</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-app-muted">
                Completion note <span className="text-brand-strong">*</span>
              </label>
              <textarea
                autoFocus
                rows={3}
                value={completionNote}
                onChange={e => setCompletionNote(e.target.value)}
                onKeyDown={handleModalKeyDown}
                placeholder="What did you accomplish? (required)"
                className="w-full px-3 py-2 text-sm text-app-text border border-border rounded-lg focus:outline-none focus:border-brand-mid resize-none"
              />
              <p className="text-[10px] text-app-muted">Ctrl+Enter to submit</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleComplete}
                disabled={saving || !completionNote.trim()}
                className="flex-1 py-2 rounded-lg bg-brand-strong text-white text-sm font-medium hover:bg-brand-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark Complete
              </button>
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2 rounded-lg border border-border text-app-text text-sm hover:bg-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
