import type { ReactNode } from 'react'

interface PanelCardProps {
  title?: string
  headerActions?: ReactNode
  children: ReactNode
  padding?: string
}

export function PanelCard({ title, headerActions, children, padding = '1.25rem' }: PanelCardProps) {
  return (
    <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
      {(title || headerActions) && (
        <div className="panel-card__header" style={{ 
          padding: '1.2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid #f1f5f9' 
        }}>
          {title && <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>}
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      <div style={{ padding }}>
        {children}
      </div>
    </div>
  )
}
