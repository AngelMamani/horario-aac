import { UserCheck, Download } from 'lucide-react'
import type { Teacher, Course } from '../../../shared/types/admin.types'

interface Hour {
  label: string
  time: string
  type: string
  index: number
}

interface ScheduleTableProps {
  days: string[]
  hours: Hour[]
  scheduleData: Record<string, string>
  loadingSchedule: boolean
  onUpdateItem: (day: string, hourIndex: number, value: string) => Promise<void>
  tutorId: string
  onUpdateTutor: (id: string) => Promise<void>
  teachers: Teacher[]
  courses: Course[]
  activeTab: string
  is6toPrimaria: boolean
  activeTargetName: string
  onExportPDF: () => void
  isReadOnly?: boolean
}

export function ScheduleTable({
  days,
  hours,
  scheduleData,
  loadingSchedule,
  onUpdateItem,
  tutorId,
  onUpdateTutor,
  teachers,
  courses,
  activeTab,
  is6toPrimaria,
  activeTargetName,
  onExportPDF,
  isReadOnly = false
}: ScheduleTableProps) {
  
  const levelCatalogCourses = courses.filter(c => 
    c.level === activeTab || (is6toPrimaria && c.level === 'Secundaria')
  ).sort((a,b) => a.name.localeCompare(b.name))

  return (
    <div className="panel-card" style={{ padding: '0', overflow: 'hidden' }}>
      <div className="panel-card__header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Edición: {activeTargetName || '---'}</h3>
          <button 
            className="btn btn--small btn--primary" 
            onClick={onExportPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#059669' }}
          >
            <Download size={14} /> Exportar PDF
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
            <UserCheck size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Tutor:</span>
          </div>
          {isReadOnly ? (
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-primary-800)' }}>
              {teachers.find(t => t.id === tutorId)?.fullName || '-- Sin asignar --'}
            </span>
          ) : (
            <select 
              value={tutorId}
              onChange={(e) => void onUpdateTutor(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: tutorId ? 'var(--color-primary-800)' : '#94a3b8', fontSize: '0.85rem', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
            >
              <option value="">-- Sin asignar --</option>
              {teachers.sort((a,b) => a.fullName.localeCompare(b.fullName)).map(t => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div id="schedule-to-print" className="table-wrapper" style={{ margin: 0 }}>
        <table style={{ minWidth: '700px' }}>
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Bloque</th>
              {days.map(day => <th key={day}>{day}</th>)}
            </tr>
          </thead>
          <tbody style={{ opacity: loadingSchedule ? 0.6 : 1 }}>
            {hours.map((hour) => {
              if (hour.type === 'break') {
                return (
                  <tr key={hour.time} style={{ background: '#f8fafc' }}>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{hour.label}</td>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '2px', fontWeight: 'bold' }}>
                      {hour.label.toUpperCase()}
                    </td>
                  </tr>
                )
              }
              return (
                <tr key={hour.index}>
                  <td style={{ textAlign: 'center', background: '#f8fafc', padding: '0.5rem' }}>
                    <strong style={{ fontSize: '0.8rem' }}>{hour.label}</strong><br/>
                    <small style={{ color: '#64748b', fontSize: '0.7rem' }}>{hour.time}</small>
                  </td>
                  {days.map((day) => {
                    const cellKey = `${day}-${hour.index}`
                    const cellValue = scheduleData[cellKey] || ''
                    const matchedCourse = courses.find(c => c.name === cellValue)
                    const bgColor = matchedCourse?.color || 'transparent'

                    return (
                      <td key={cellKey} style={{ padding: '2px', height: '55px', background: bgColor, border: '1px solid #f1f5f9' }}>
                        {isReadOnly ? (
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#000',
                            fontSize: '0.85rem',
                            fontWeight: '800'
                          }}>
                            {cellValue || ''}
                          </div>
                        ) : (
                          <select 
                            value={cellValue}
                            onChange={(e) => void onUpdateItem(day, hour.index, e.target.value)}
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              border: cellValue ? 'none' : '1px dashed #e2e8f0', 
                              textAlignLast: 'center',
                              background: cellValue ? bgColor : 'transparent',
                              color: '#000',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              outline: 'none',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            <option value="">-- Vacío --</option>
                            <optgroup label={`CURSOS ${activeTab.toUpperCase()}`}>
                              {levelCatalogCourses.filter(c => c.level === activeTab).map(course => (
                                <option key={course.id} value={course.name}>{course.name}</option>
                              ))}
                            </optgroup>
                            {is6toPrimaria && (
                              <optgroup label="CURSOS SECUNDARIA">
                                {levelCatalogCourses.filter(c => c.level === 'Secundaria').map(course => (
                                  <option key={course.id} value={course.name}>{course.name}</option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
