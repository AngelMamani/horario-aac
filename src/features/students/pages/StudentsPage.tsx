import { useState } from 'react'
import { useStudents } from '../hooks/useStudents'
import { useGrades } from '../../grades/hooks/useGrades'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PanelCard } from '../../../shared/components/PanelCard'
import { StudentForm } from '../components/StudentForm'
import { StudentTable } from '../components/StudentTable'
import { GraduationCap } from 'lucide-react'
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

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar estudiante?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c03d3d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    })

    if (result.isConfirmed) {
      await deleteStudent(id)
      void Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Estudiante eliminado',
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  return (
    <section>
      <PageHeader 
        title="Estudiantes" 
        subtitle="Gestión de matrícula y seguimiento de alumnos."
        icon={GraduationCap}
      />

      <PanelCard title="Registrar Nuevo Estudiante">
        <StudentForm 
          fullName={fullName}
          onNameChange={setFullName}
          gradeId={gradeId}
          onGradeChange={setGradeId}
          grades={grades}
          status={status}
          onStatusChange={setStatus}
          onSubmit={handleSubmit}
        />
      </PanelCard>

      <div style={{ height: '1.5rem' }} />

      <PanelCard 
        title="Lista de Estudiantes" 
        headerActions={<span>{students.length} alumnos registrados</span>}
        padding="0"
      >
        <StudentTable 
          students={students}
          loading={loading}
          onDelete={handleDelete}
        />
      </PanelCard>
    </section>
  )
}
