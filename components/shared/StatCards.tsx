interface StatCard {
  emoji: string
  value: string | number
  label: string
}

interface StatCardsProps {
  cards: [StatCard, StatCard, StatCard]
}

export default function StatCards({ cards }: StatCardsProps) {
  return (
    <div className="flex gap-3 mt-3">
      {cards.map((card, i) => (
        <div
          key={i}
          className="flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-surface border border-border"
        >
          <span className="text-xl">{card.emoji}</span>
          <span className="text-base font-bold text-app-text">{card.value}</span>
          <span className="text-[11px] text-app-muted text-center leading-tight">{card.label}</span>
        </div>
      ))}
    </div>
  )
}
