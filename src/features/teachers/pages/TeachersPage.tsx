import { useState } from 'react'
import Swal from 'sweetalert2'
import { useTeachers } from '../hooks/useTeachers'

function showToast(icon: 'success' | 'error' | 'warning' | 'info', title: string, timer = 1800) {
  void Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer,
  })
}

export function TeachersPage() {
  const { teachers, loading, addTeacher, deleteTeacher, updateTeacher } = useTeachers()
  const [fullName, setFullName] = useState('')
  const [position, setPosition] = useState('')

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim() || !position.trim()) {
      showToast('error', 'Completa el nombre y el cargo del docente')
      return
    }
    await addTeacher({ 
      fullName: fullName.trim().toUpperCase(), 
      position: position.trim().toUpperCase() 
    })
    showToast('success', 'Docente registrado con éxito')
    setFullName('')
    setPosition('')
  }

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Eliminar docente',
      text: `¿Estás seguro de eliminar a ${name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c03d3d',
      cancelButtonColor: '#0e4a7f',
    })

    if (result.isConfirmed) {
      await deleteTeacher(id)
      showToast('success', 'Docente eliminado permanentemente')
    }
  }

  const handleEdit = async (teacher: any) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Docente',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 0.8rem;">
          <label style="font-size: 0.8rem; color: #64748b;">Nombre Completo</label>
          <input id="swal-name" class="swal2-input" value="${teacher.fullName}" placeholder="NOMBRE" style="margin: 0; width: 100%;">
          <label style="font-size: 0.8rem; color: #64748b; margin-top: 0.5rem;">Cargo o Responsabilidad</label>
          <input id="swal-position" class="swal2-input" value="${teacher.position || ''}" placeholder="CARGO" style="margin: 0; width: 100%;">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0e4a7f',
      preConfirm: () => {
        const name = (document.getElementById('swal-name') as HTMLInputElement).value
        const pos = (document.getElementById('swal-position') as HTMLInputElement).value
        if (!name.trim() || !pos.trim()) {
          Swal.showValidationMessage('Ambos campos son obligatorios')
          return false
        }
        return { fullName: name.toUpperCase(), position: pos.toUpperCase() }
      }
    })

    if (formValues) {
      await updateTeacher(teacher.id, formValues)
      showToast('success', 'Datos actualizados con éxito')
    }
  }

  return (
    <section>
      <header className="page-header">
        <h2>Docentes</h2>
        <p>Equipo académico de la institución.</p>
      </header>

      <div className="panel-card form-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary-900)' }}>Registrar Nuevo Docente</h3>
        <form className="admin-form" onSubmit={(e) => void handleAddTeacher(e)} style={{ gap: '1rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Nombres y Apellidos</label>
            <input
              type="text"
              placeholder="DOCENTE COMPLETO"
              value={fullName}
              onChange={(e) => setFullName(e.target.value.toUpperCase())}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Cargo (ID del Docente)</label>
            <input
              type="text"
              placeholder="e.j. 1 DE PRIMARIA, COMPUTACION, etc."
              value={position}
              onChange={(e) => setPosition(e.target.value.toUpperCase())}
              style={{ width: '100%' }}
            />
          </div>
          <button type="submit" className="btn btn--primary" style={{ gridColumn: 'span 4', padding: '0.8rem' }}>
            Registrar Docente
          </button>
        </form>
      </div>

      <div className="panel-card">
        <div className="panel-card__header">
          <h3>Lista de Docentes</h3>
          <span>({teachers.length} registrados)</span>
        </div>
        <div className="table-wrapper">
          {loading ? (
             <p style={{ padding: '1rem' }}>Cargando docentes desde Firebase...</p>
          ) : (
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
                      <td colSpan={3} style={{ textAlign: 'center', padding: '2rem' }}>No hay docentes registrados aún. ¡Registra tu primer docente arriba!</td>
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
                               style={{ backgroundColor: 'var(--color-primary-600)' }}
                               onClick={() => void handleEdit(teacher)}
                            >
                               Editar
                            </button>
                            <button 
                               type="button" 
                               className="btn btn--danger btn--small" 
                               onClick={() => void handleDelete(teacher.id, teacher.fullName)}
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
          )}
        </div>
      </div>
    </section>
  )
}
