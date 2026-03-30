import { useState } from 'react'
import { useStudents } from '../hooks/useStudents'
import { useGrades } from '../../grades/hooks/useGrades'
import Swal from 'sweetalert2'

export function StudentsPage() {
  const { students, loading, addStudent, deleteStudent } = useStudents()
  const { grades } = useGrades()
  
  const [fullName, setFullName] = useState('')
  const [gradeId, setGradeId] = useState('')
  const [status, setStatus] = useState('Regular')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !gradeId) return
    
    const selectedGrade = grades.find(g => g.id === gradeId)
    await addStudent({
      fullName: fullName.toUpperCase(),
      grade: selectedGrade ? selectedGrade.name : gradeId,
      status
    })
    
    setFullName('')
    setGradeId('')
    void Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Estudiante registrado',
      showConfirmButton: false,
      timer: 1500
    })
  }

  return (
    <section className="animate-in">
      <header className="page-header">
        <h2>Estudiantes</h2>
        <p>Gestión de matrícula y seguimiento de alumnos.</p>
      </header>

      <div className="panel-card form-card" style={{ marginBottom: '1.5rem' }}>
        <h3>Registrar Nuevo Estudiante</h3>
        <form className="admin-form" onSubmit={(e) => void handleSubmit(e)}>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="modal-label">Nombre Completo</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              placeholder="APELLIDOS Y NOMBRES"
            />
          </div>
          <div>
            <label className="modal-label">Grado</label>
            <select value={gradeId} onChange={e => setGradeId(e.target.value)}>
              <option value="">Seleccionar grado</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="modal-label">Condición</label>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Regular">Regular</option>
              <option value="Beca">Beca</option>
              <option value="Traslado">Traslado</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary" style={{ marginTop: 'auto' }}>
            Registrar
          </button>
        </form>
      </div>

      <div className="panel-card">
        <div className="table-wrapper">
          {loading ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando estudiantes...</p>
          ) : (
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
                        onClick={() => void deleteStudent(student.id)}
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
          )}
        </div>
      </div>
    </section>
  )
}
