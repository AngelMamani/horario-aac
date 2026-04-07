import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle: string
  icon?: LucideIcon
  children?: ReactNode
}

export function PageHeader({ title, subtitle, icon: Icon, children }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {Icon && (
          <div style={{ 
            background: 'var(--color-primary-800)', 
            color: '#fff', 
            padding: '0.8rem', 
            borderRadius: '12px',
            display: 'grid',
            placeItems: 'center'
          }}>
            <Icon size={24} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {children && <div>{children}</div>}
      </div>
    </header>
  )
}
