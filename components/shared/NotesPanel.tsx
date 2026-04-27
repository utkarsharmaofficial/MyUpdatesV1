interface NotesPanelProps {
  notes: string
}

export default function NotesPanel({ notes }: NotesPanelProps) {
  if (!notes) return null

  return (
    <div className="mt-4 p-4 rounded-xl bg-surface border border-border">
      <p className="text-xs font-semibold text-app-muted mb-2">📝 Notes</p>
      <p className="text-sm text-app-text whitespace-pre-wrap leading-relaxed">{notes}</p>
    </div>
  )
}
