'use client'

interface Section {
  id: string
  type: 'workout' | 'expenses' | 'custom'
  name: string
  notes: string | null
  position: number
}

interface NavBarProps {
  sections: Section[]
  activeId: string
  onTabChange: (id: string) => void
  onAddSectionClick: () => void
  onRemoveSection: (id: string) => void
  canAddMore: boolean
}

export default function NavBar({
  sections,
  activeId,
  onTabChange,
  onAddSectionClick,
  onRemoveSection,
  canAddMore,
}: NavBarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-border overflow-x-auto pb-0">
      {/* Daily Tasks — always first, no remove */}
      <button
        onClick={() => onTabChange('daily-tasks')}
        className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
          activeId === 'daily-tasks'
            ? 'border-brand-strong text-brand-strong'
            : 'border-transparent text-app-muted hover:text-app-text'
        }`}
      >
        ✅ Daily Tasks
      </button>

      {/* Dynamic section tabs */}
      {sections.map(section => (
        <div key={section.id} className="relative flex-shrink-0 group">
          <button
            onClick={() => onTabChange(section.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px pr-7 ${
              activeId === section.id
                ? 'border-brand-strong text-brand-strong'
                : 'border-transparent text-app-muted hover:text-app-text'
            }`}
          >
            {section.name}
          </button>
          {/* Remove button — visible on hover */}
          <button
            onClick={e => { e.stopPropagation(); onRemoveSection(section.id) }}
            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-app-muted text-white text-xs leading-none flex items-center justify-center hover:bg-brand-strong opacity-0 group-hover:opacity-100 transition-opacity"
            title={`Remove ${section.name}`}
            aria-label={`Remove ${section.name}`}
          >
            ×
          </button>
        </div>
      ))}

      {/* Add Section button */}
      <button
        onClick={canAddMore ? onAddSectionClick : undefined}
        disabled={!canAddMore}
        title={!canAddMore ? 'Maximum 3 sections reached' : 'Add a new section'}
        className={`flex-shrink-0 px-4 py-2.5 text-sm border-b-2 border-transparent -mb-px transition-colors ${
          canAddMore
            ? 'text-app-muted hover:text-brand-strong'
            : 'text-border-strong cursor-not-allowed opacity-50'
        }`}
      >
        + Add Section
      </button>
    </div>
  )
}
