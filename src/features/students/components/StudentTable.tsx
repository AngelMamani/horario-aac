import type { Student } from '../../../shared/types/admin.types'

interface StudentTableProps {
  students: Student[]
  loading: boolean
  onDelete: (id: string) => Promise<void>
}

export function StudentTable({ students, loading, onDelete }: StudentTableProps) {
  if (loading) return <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando estudiantes...</p>

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Nombre completo</th>
            <th>Grado / Sección</th>
            <th>Condición</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td><strong>{student.fullName}</strong></td>
              <td>{student.grade}</td>
              <td>
                <span className={`badge ${student.status === 'Regular' ? 'badge--low' : 'badge--medium'}`}>
                  {student.status}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <button 
                  className="btn btn--danger btn--small"
                  onClick={() => onDelete(student.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                No hay estudiantes registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
