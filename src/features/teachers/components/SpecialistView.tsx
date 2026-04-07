import { Users, BookOpen, Save, X } from 'lucide-react'
import type { Teacher, Course, GradeCourse } from '../../../shared/types/admin.types'

interface SpecialistViewProps {
  teachers: Teacher[]
  selectedTeacherId: string
  onTeacherChange: (id: string) => void
  specialistSubjects: any[]
  subjectSearch: string
  onSubjectSearchChange: (val: string) => void
  selectedSubjectKeys: string[]
  onSubjectToggle: (key: string, checked: boolean) => void
  allSpecialistAssignments: GradeCourse[]
  courses: Course[]
  specialistGrades: any[]
  activeAssignments: Record<string, string[]>
  onToggleAssignment: (key: string, gid: string) => void
  totalAssignmentsCount: number
  onSave: () => Promise<void>
  onClearAll: () => Promise<void>
  onUnassign: (gid: string, cid: string, tname: string, sname: string) => Promise<void>
  loadingAssignments: boolean
}

export function SpecialistView({
  teachers,
  selectedTeacherId,
  onTeacherChange,
  specialistSubjects,
  subjectSearch,
  onSubjectSearchChange,
  selectedSubjectKeys,
  onSubjectToggle,
  allSpecialistAssignments,
  courses,
  specialistGrades,
  activeAssignments,
  onToggleAssignment,
  totalAssignmentsCount,
  onSave,
  onClearAll,
  onUnassign,
  loadingAssignments,
}: SpecialistViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="panel-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ margin: '0 0 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
          <Users size={18} color="#0891b2" /> Paso 1 — Seleccionar Docente
        </h4>
        <select
          value={selectedTeacherId}
          onChange={e => onTeacherChange(e.target.value)}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
        >
          <option value="">-- Elegir docente --</option>
          {teachers
            .filter(t => !t.id.includes('años'))
            .sort((a,b) => a.fullName.localeCompare(b.fullName))
            .map(t => (
              <option key={t.id} value={t.id}>
                {t.fullName} {t.position ? `(${t.position})` : ''}
              </option>
            ))
          }
        </select>
      </div>

      {selectedTeacherId && (
        <div className="panel-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
              <BookOpen size={18} color="#0891b2" /> Paso 2 — Marcar Materias
            </h4>
            <input 
              type="text" 
              placeholder="Buscar materia..." 
              value={subjectSearch}
              onChange={e => onSubjectSearchChange(e.target.value)}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', width: '200px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto', padding: '0.8rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {specialistSubjects
              .filter(s => s.name.toLowerCase().includes(subjectSearch.toLowerCase()))
              .map(subject => {
                const isSelected = selectedSubjectKeys.includes(subject.idKey)
                const assignmentsWithKey = allSpecialistAssignments.filter(a => {
                  const c = courses.find(cc => cc.id === a.courseId)
                  return c?.name === subject.name && c?.level === subject.level
                })
                const otherTeachers = Array.from(new Set(assignmentsWithKey.map(a => a.teacherId))).filter(tid => tid !== selectedTeacherId)
                
                return (
                  <label
                    key={subject.idKey}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.7rem',
                      background: isSelected ? '#ecfdf5' : '#fff',
                      borderRadius: '8px',
                      border: `1px solid ${isSelected ? '#86efac' : '#f1f5f9'}`,
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e => onSubjectToggle(subject.idKey, e.target.checked)}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {subject.name}
                        <span style={{ fontSize: '0.6rem', color: '#94a3b8', background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px' }}>
                          {subject.level === 'Primaria' ? 'PRI' : 'SEC'}
                        </span>
                      </span>
                      {otherTeachers.length > 0 && (
                        <div style={{ fontSize: '0.6rem', color: '#ea580c' }}> {otherTeachers.length} ya asignado(s) </div>
                      )}
                    </div>
                  </label>
                )
              })}
          </div>
        </div>
      )}

      {selectedSubjectKeys.length > 0 && (
        <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="panel-card__header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Paso 3 — Elegir Grados para cada Materia</h4>
            <span style={{ fontSize: '0.8rem', color: '#0891b2', fontWeight: 'bold' }}> {totalAssignmentsCount} asignaciones </span>
          </div>
          <div className="table-wrapper" style={{ margin: 0 }}>
            <table style={{ minWidth: '400px' }}>
              <thead>
                <tr>
                  <th>Materia</th>
                  {specialistGrades.map(g => <th key={g.id} style={{ textAlign: 'center' }}>{g.shortName}</th>)}
                </tr>
              </thead>
              <tbody>
                {[...selectedSubjectKeys].sort().map(idKey => {
                  const [name, level] = idKey.split('|')
                  const subject = specialistSubjects.find(s => s.idKey === idKey)
                  const assignedGrades = activeAssignments[idKey] || []
                  return (
                    <tr key={idKey}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: subject?.color || '#94a3b8' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: '0.8rem' }}>{name}</strong>
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{level}</span>
                          </div>
                        </div>
                      </td>
                      {specialistGrades.map(g => (
                        <td key={g.id} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => onToggleAssignment(idKey, g.id)}>
                          <input type="checkbox" checked={assignedGrades.includes(g.id)} onChange={() => {}} />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn--primary"
              onClick={() => void onSave()}
              style={{ background: '#0891b2', padding: '0.7rem 1.8rem', fontWeight: 'bold', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} /> Confirmar {totalAssignmentsCount} Asignaciones
            </button>
          </div>
        </div>
      )}

      <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="panel-card__header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Resumen de Asignaciones Actuales</h4>
          {allSpecialistAssignments.length > 0 && (
            <button onClick={() => void onClearAll()} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
               Limpiar Todo
            </button>
          )}
        </div>
        <div className="table-wrapper" style={{ margin: 0 }}>
          <table style={{ minWidth: '450px' }}>
            <thead>
              <tr>
                <th>Materia</th>
                {specialistGrades.map(g => <th key={g.id} style={{ textAlign: 'center' }}>{g.shortName}</th>)}
              </tr>
            </thead>
            <tbody>
              {loadingAssignments ? (
                <tr><td colSpan={specialistGrades.length + 1} style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</td></tr>
              ) : (
                specialistSubjects.map(subject => {
                  const hasAny = specialistGrades.some(g =>
                    allSpecialistAssignments.some(a => {
                      const c = courses.find(cc => cc.id === a.courseId)
                      return c?.name === subject.name && c?.level === subject.level && a.gradeId === g.id
                    })
                  )
                  return (
                    <tr key={subject.idKey} style={{ opacity: hasAny ? 1 : 0.45 }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: subject.color || '#e2e8f0' }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.8rem' }}>{subject.name}</span>
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{subject.level}</span>
                          </div>
                        </div>
                      </td>
                      {specialistGrades.map(g => {
                        const assignment = allSpecialistAssignments.find(a => {
                           const c = courses.find(cc => cc.id === a.courseId)
                           return c?.name === subject.name && c?.level === subject.level && a.gradeId === g.id
                        })
                        const teacher = assignment ? teachers.find(t => t.id === assignment.teacherId) : null
                        return (
                          <td key={g.id} style={{ textAlign: 'center', fontSize: '0.7rem' }}>
                            {teacher ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <span>{teacher.fullName.split(' ').slice(0, 2).join(' ')}</span>
                                <button onClick={() => void onUnassign(g.id, assignment!.courseId, teacher.fullName, subject.name)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><X size={12} /></button>
                              </div>
                            ) : '---'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
