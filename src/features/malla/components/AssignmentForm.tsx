import type { Course, Teacher, GradeCourse } from '../../../shared/types/admin.types'

interface AssignmentFormProps {
  courses: Course[]
  teachers: Teacher[]
  selectedCourses: string[]
  onToggleCourse: (id: string) => void
  selectedTeacher: string
  onTeacherChange: (id: string) => void
  gradeCourses: GradeCourse[]
  onAssign: () => Promise<void>
}

export function AssignmentForm({
  courses,
  teachers,
  selectedCourses,
  onToggleCourse,
  selectedTeacher,
  onTeacherChange,
  gradeCourses,
  onAssign,
}: AssignmentFormProps) {
  return (
    <div className="manage-group-form">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label className="modal-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>Cursos (Selección Múltiple)</label>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#f9fafb' }}>
            {courses.map(c => {
              const isAssigned = gradeCourses.some(gc => gc.courseId === c.id)
              return (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isAssigned ? 'not-allowed' : 'pointer', opacity: isAssigned ? 0.5 : 1 }}>
                  <input 
                    type="checkbox" 
                    checked={selectedCourses.includes(c.id) || isAssigned}
                    disabled={isAssigned}
                    onChange={() => onToggleCourse(c.id)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '0.95rem' }}>{c.name}</span>
                </label>
              )
            })}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <label className="modal-label" style={{ fontWeight: 'bold' }}>Docente a cargo</label>
            <select 
              value={selectedTeacher} 
              onChange={e => onTeacherChange(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">-- Seleccionar Docente --</option>
                {teachers
                    .sort((a,b) => a.fullName.localeCompare(b.fullName))
                    .map(t => (
                        <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))
                }
            </select>
          </div>
          <button type="button" className="btn btn--primary" onClick={() => void onAssign()} style={{ padding: '0.8rem 1.5rem' }}>
            Asignar Seleccionados
          </button>
        </div>
      </div>
    </div>
  )
}
