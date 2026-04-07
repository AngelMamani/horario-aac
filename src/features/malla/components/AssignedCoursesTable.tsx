import type { Course, Teacher, GradeCourse } from '../../../shared/types/admin.types'

interface AssignedCoursesTableProps {
  gradeCourses: GradeCourse[]
  courses: Course[]
  teachers: Teacher[]
  onRemove: (id: string) => Promise<void>
}

export function AssignedCoursesTable({
  gradeCourses,
  courses,
  teachers,
  onRemove,
}: AssignedCoursesTableProps) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Curso</th>
            <th>Docente responsable</th>
            <th style={{ textAlign: 'center' }}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {gradeCourses.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>Aún no hay cursos asignados a este grado. Selecciona arriba para comenzar.</td>
            </tr>
          ) : (
            gradeCourses.map(gc => {
              const courseName = courses.find(c => c.id === gc.courseId)?.name || 'Curso Desconocido'
              const teacherName = teachers.find(t => t.id === gc.teacherId)?.fullName || 'Docente Desconocido'
              
              return (
                <tr key={gc.id}>
                  <td><strong>{courseName}</strong></td>
                  <td>{teacherName}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      type="button" 
                      className="btn btn--danger btn--small"
                      onClick={() => void onRemove(gc.id)}
                    >
                      Remover
                    </button>
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
