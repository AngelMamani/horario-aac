import type { Course } from '../../../shared/types/admin.types'

type CourseTableProps = {
  courses: Course[]
}

export function CourseTable({ courses }: CourseTableProps) {
  return (
    <div className="panel-card">
      <div className="panel-card__header">
        <h3>Cursos</h3>
        <span>Gestion curricular por curso</span>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Curso</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
