import type { DashboardStat } from '../../../shared/types/admin.types'

type StatCardProps = {
  stat: DashboardStat
}

const iconMap: Record<string, string> = {
  students: '👥',
  teachers: '👨‍🏫',
  sections: '🏢',
  attendance: '📈',
  courses: '📚'
}

export function StatCard({ stat }: StatCardProps) {
  const icon = iconMap[stat.id] || '📊'
  
  return (
    <article className="stat-card">
      <div className="stat-card__icon-badge">
         {icon}
      </div>
      <div className="stat-card__content">
        <p className="stat-card__title">{stat.title}</p>
        <p className="stat-card__value">{stat.value}</p>
        <p className="stat-card__detail">{stat.detail}</p>
      </div>
    </article>
  )
}
