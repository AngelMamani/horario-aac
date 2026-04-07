import type { Teacher } from '../../../shared/types/admin.types'

interface TeacherTableProps {
  teachers: Teacher[]
  loading: boolean
  onEdit: (teacher: Teacher) => Promise<void>
  onDelete: (id: string, name: string) => Promise<void>
}

export function TeacherTable({
  teachers,
  loading,
  onEdit,
  onDelete,
}: TeacherTableProps) {
  if (loading) return <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando docentes...</p>

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Docente</th>
            <th>Cargo / Responsabilidad</th>
            <th style={{ width: '200px', textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {teachers.length === 0 ? (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>No hay docentes registrados aún.</td>
            </tr>
          ) : (
            teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td><strong>{teacher.fullName}</strong></td>
                <td>
                  <span style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px', color: '#444' }}>
                    {teacher.position || 'SIN CARGO'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button 
                      type="button" 
                      className="btn btn--primary btn--small" 
                      onClick={() => void onEdit(teacher)}
                    >
                      Editar
                    </button>
                    <button 
                      type="button" 
                      className="btn btn--danger btn--small" 
                      onClick={() => void onDelete(teacher.id, teacher.fullName)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
