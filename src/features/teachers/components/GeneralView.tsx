import { Users, Sparkles, Trash2 } from 'lucide-react'
import type { Teacher, Course, Grade, GradeCourse } from '../../../shared/types/admin.types'

interface GeneralViewProps {
  generalGrades: Grade[]
  generalGradeId: string
  onGradeChange: (id: string) => void
  isUnifiedGrade: (id: string) => boolean
  isSelected4or5: boolean
  onGeneralMasiva: () => Promise<void>
  onClearAll: () => Promise<void>
  generalLoading: boolean
  generalGradeCourses: GradeCourse[]
  courses: Course[]
  teachers: Teacher[]
  onUnassign: (gid: string, cid: string, tname: string, sname: string) => Promise<void>
}

export function GeneralView({
  generalGrades,
  generalGradeId,
  onGradeChange,
  isUnifiedGrade,
  isSelected4or5,
  onGeneralMasiva,
  onClearAll,
  generalLoading,
  generalGradeCourses,
  courses,
  teachers,
  onUnassign,
}: GeneralViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="panel-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}> <Users size={16} /> Seleccionar Grado </h4>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {generalGrades.map(g => {
            const isGrouped = isSelected4or5 && isUnifiedGrade(g.id)
            const isActive = g.id === generalGradeId || isGrouped
            return (
              <button
                key={g.id}
                onClick={() => onGradeChange(g.id)}
                style={{
                  padding: '0.5rem 1.25rem', borderRadius: '20px', whiteSpace: 'nowrap',
                  fontSize: '0.85rem', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                  background: isActive ? 'var(--color-primary-800)' : '#f1f5f9',
                  color: isActive ? '#fff' : '#475569',
                  position: 'relative'
                }}
              > 
                {g.name} 
                {isUnifiedGrade(g.id) && (
                  <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#0891b2', color: '#fff', fontSize: '0.55rem', padding: '1px 4px', borderRadius: '4px' }}>
                    UNI
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {generalGradeId && (
        <div className="panel-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ margin: 0 }}>Cursos de {generalGrades.find(g => g.id === generalGradeId)?.name}</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn--primary btn--small" onClick={() => void onGeneralMasiva()}> <Sparkles size={14} /> Masiva </button>
              {generalGradeCourses.length > 0 && (
                <button className="btn btn--danger btn--small" onClick={() => void onClearAll()}> <Trash2 size={14} /> Limpiar </button>
              )}
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Curso</th><th>Docente</th><th>Acción</th></tr></thead>
              <tbody>
                {generalLoading ? ( <tr><td colSpan={3}>Cargando...</td></tr> ) : generalGradeCourses.length === 0 ? ( <tr><td colSpan={3}>Sin asignaciones.</td></tr> ) : (
                  generalGradeCourses.map(gc => {
                    const course = courses.find(c => c.id === gc.courseId)
                    const teacherName = teachers.find(t => t.id === gc.teacherId)?.fullName || '---'
                    return (
                      <tr key={gc.id}>
                        <td><strong>{course?.name}</strong> <span style={{fontSize:'0.7rem', color:'#94a3b8'}}>({course?.level})</span></td>
                        <td>{teacherName}</td>
                        <td>
                          <button onClick={() => void onUnassign(gc.gradeId, gc.courseId, teacherName, course?.name || '')} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}> Quitar </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
