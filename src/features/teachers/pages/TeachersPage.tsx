import { useState } from 'react'
import Swal from 'sweetalert2'
import { useTeachers } from '../hooks/useTeachers'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PanelCard } from '../../../shared/components/PanelCard'
import { TeacherForm } from '../components/TeacherForm'
import { TeacherTable } from '../components/TeacherTable'
import { Users } from 'lucide-react'
import type { Teacher } from '../../../shared/types/admin.types'

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

  const handleEdit = async (teacher: Teacher) => {
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
      <PageHeader 
        title="Docentes" 
        subtitle="Equipo académico de la institución."
        icon={Users}
      />

      <PanelCard title="Registrar Nuevo Docente">
        <TeacherForm 
           fullName={fullName}
           onNameChange={setFullName}
           position={position}
           onPositionChange={setPosition}
           onSubmit={handleAddTeacher}
        />
      </PanelCard>

      <div style={{ height: '1.5rem' }} />

      <PanelCard 
        title="Lista de Docentes" 
        headerActions={<span>({teachers.length} registrados)</span>}
        padding="0"
      >
        <TeacherTable 
           teachers={teachers}
           loading={loading}
           onEdit={handleEdit}
           onDelete={handleDelete}
        />
      </PanelCard>
    </section>
  )
}
