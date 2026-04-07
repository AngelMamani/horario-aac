interface StatCardData {
  title: string
  total: string
  detail: string
}

interface StatCardsProps {
  categories: StatCardData[]
}

export function StatCards({ categories }: StatCardsProps) {
  return (
    <section className="stats-grid" style={{ marginBottom: '2rem' }}>
      {categories.map((report, idx) => (
        <div 
          key={idx} 
          className="stat-card animate-pop-in" 
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          <div className="stat-card__icon-badge">📊</div>
          <div className="stat-card__content">
            <p className="stat-card__title">{report.title}</p>
            <p className="stat-card__value">{report.total}</p>
            <p className="stat-card__detail">{report.detail}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
