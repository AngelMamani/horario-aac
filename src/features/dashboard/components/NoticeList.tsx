import type { Notice } from '../../../shared/types/admin.types'

type NoticeListProps = {
  notices: Notice[]
}

const priorityClassMap: Record<Notice['priority'], string> = {
  Alta: 'badge badge--high',
  Media: 'badge badge--medium',
  Baja: 'badge badge--low',
}

export function NoticeList({ notices }: NoticeListProps) {
  return (
    <div className="panel-card">
      <div className="panel-card__header">
        <h3>Avisos institucionales</h3>
        <span>Gestión académica y administrativa</span>
      </div>
      <ul className="notice-list">
        {notices.map((notice) => (
          <li key={notice.id} className="notice-item">
            <div className="notice-item__top">
              <h4>{notice.title}</h4>
              <span className={priorityClassMap[notice.priority]}>{notice.priority}</span>
            </div>
            <p>{notice.description}</p>
            <small>Fecha límite: {notice.dueDate}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
