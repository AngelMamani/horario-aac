import { Trash2, Edit3 } from 'lucide-react'
import type { Course } from '../../../shared/types/admin.types'

interface CourseTableProps {
  filteredCourses: Course[]
  allCourses: Course[]
  activeTab: Course['level']
  onPickSmartColor: (existing: Course[]) => string
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>
  onEdit: (id: string, course: Course) => Promise<void>
  onDelete: (id: string, courseName: string) => Promise<void>
  loading: boolean
}

export function CourseTable({
  filteredCourses,
  allCourses,
  activeTab,
  onPickSmartColor,
  updateCourse,
  onEdit,
  onDelete,
  loading,
}: CourseTableProps) {
  if (loading) return <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando cursos...</p>

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style={{ width: '60px' }}>Color</th>
            <th>Materia / Curso</th>
            <th>Otros Niveles</th>
            <th style={{ width: '150px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredCourses.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No hay cursos en este nivel.</td>
            </tr>
          ) : (
            filteredCourses.map((course) => {
              const otherLevels = allCourses.filter(c => c.name === course.name && c.level !== activeTab).map(c => c.level)
              return (
                <tr key={course.id}>
                  <td style={{ textAlign: 'center' }}>
                    <div 
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          background: course.color || '#cbd5e1', 
                          border: '2px solid #fff', 
                          boxShadow: '0 0 0 1px #eee' 
                        }} 
                        onClick={() => {
                            const c = onPickSmartColor(allCourses.filter(lc => lc.level === activeTab));
                            void updateCourse(course.id, { color: c });
                        }}
                        title="Click para cambiar color"
                    />
                  </td>
                  <td style={{ fontWeight: '700' }}>{course.name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {otherLevels.map(lvl => <span key={lvl} style={{ fontSize: '0.65rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{lvl}</span>)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                      <button className="btn btn--small" style={{ padding: '0.4rem' }} onClick={() => void onEdit(course.id, course)} title="Editar"><Edit3 size={14}/></button>
                      <button className="btn btn--small btn--danger" style={{ padding: '0.4rem' }} onClick={() => void onDelete(course.id, course.name)} title="Eliminar"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
