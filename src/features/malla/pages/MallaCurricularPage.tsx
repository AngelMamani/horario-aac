import { useState, useMemo, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useGrades } from '../../grades/hooks/useGrades'
import { useCourses } from '../../courses/hooks/useCourses'
import { useTeachers } from '../../teachers/hooks/useTeachers'
import { useGradeCourses } from '../../grades/hooks/useGradeCourses'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PanelCard } from '../../../shared/components/PanelCard'
import { AssignmentForm } from '../components/AssignmentForm'
import { AssignedCoursesTable } from '../components/AssignedCoursesTable'
import { BookOpen } from 'lucide-react'
import type { Grade } from '../../../shared/types/admin.types'

export function MallaCurricularPage() {
  const { grades, loading: gradesLoading } = useGrades()
  const { courses, loading: coursesLoading } = useCourses()
  const { teachers, loading: teachersLoading } = useTeachers()

  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [selectedGrade, setSelectedGrade] = useState('')
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState('')

  const memoizedLevels = useMemo(() => {
    const levels: Record<string, Grade[]> = {
      'Inicial': [],
      'Primaria': [],
      'Secundaria': []
    }
    grades.forEach(g => {
      if (levels[g.level]) {
        levels[g.level].push(g)
      }
    })
    return levels
  }, [grades])

  const levels = ['Inicial', 'Primaria', 'Secundaria']

  useEffect(() => {
    if (!selectedGroup && levels.length > 0) {
      setSelectedGroup(levels[0])
    }
  }, [selectedGroup])

  const { gradeCourses, loading: gradeCoursesLoading, assignCourseToGrade, removeCourseFromGrade } = useGradeCourses(selectedGrade || null)

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleAssign = async () => {
    if (selectedCourses.length === 0 || !selectedTeacher || !selectedGrade) {
      void Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Debes seleccionar al menos un curso y un docente.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000
      })
      return
    }

    const alreadyAssigned = selectedCourses.filter(courseId => 
      gradeCourses.some(gc => gc.courseId === courseId)
    )

    if (alreadyAssigned.length > 0) {
      void Swal.fire({
        icon: 'error',
        title: 'Cursos ya asignados',
        text: 'Algunos de los cursos seleccionados ya están asignados a este grado.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500
      })
      return
    }

    const promises = selectedCourses.map(courseId => 
      assignCourseToGrade(selectedGrade, courseId, selectedTeacher)
    )
    
    await Promise.all(promises)
    
    setSelectedCourses([])
    setSelectedTeacher('')
    
    void Swal.fire({
      icon: 'success',
      title: 'Asignación exitosa',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    })
  }

  const isLoading = gradesLoading || coursesLoading || teachersLoading || gradeCoursesLoading

  return (
    <section>
      <PageHeader 
        title="Malla Curricular" 
        subtitle="Asigna cursos y docentes a cada grado y sección."
        icon={BookOpen}
      />

      <PanelCard title="1. Seleccionar Nivel y Grado">
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0', marginBottom: '1.5rem', overflowX: 'auto' }}>
          {levels.map(level => (
            <button 
              key={level} 
              type="button" 
              onClick={() => { 
                setSelectedGroup(level); 
                setSelectedGrade(''); 
                setSelectedCourses([]);
                setSelectedTeacher('');
              }}
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: selectedGroup === level ? 'var(--color-primary-800)' : 'transparent',
                fontWeight: 'bold',
                color: selectedGroup === level ? '#fff' : '#64748b',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {level}
            </button>
          ))}
        </div>

        <select 
          value={selectedGrade} 
          onChange={e => {
            setSelectedGrade(e.target.value)
            setSelectedCourses([])
            setSelectedTeacher('')
          }}
          disabled={gradesLoading || !selectedGroup}
          style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #ccc', fontSize: '1rem' }}
        >
          <option value="">-- Elige una opción para ver su malla --</option>
          {selectedGroup === 'Secundaria' ? (
            <>
              {[...new Set(memoizedLevels['Secundaria']?.map(g => g.secondaryGroup).filter(Boolean))].sort().map(group => (
                <option key={group} value={group!}>{group} (Grupo completo)</option>
              ))}
              {memoizedLevels['Secundaria']?.filter(g => !g.secondaryGroup).map(grade => (
                <option key={grade.id} value={grade.id}>{grade.name} (Sin grupo)</option>
              ))}
            </>
          ) : (
            memoizedLevels[selectedGroup]?.map(grade => (
              <option key={grade.id} value={grade.id}>{grade.name}</option>
            ))
          )}
        </select>
      </PanelCard>

      <div style={{ height: '1.5rem' }} />

      {selectedGrade && !isLoading && (
        <PanelCard 
          title="2. Asignar Cursos y Docentes" 
          headerActions={<span style={{ fontSize: '0.8rem', color: '#666' }}>
            {selectedGroup === 'Secundaria' && selectedGrade.startsWith('Secundaria') 
              ? `Grupo: ${selectedGrade}`
              : `Grado: ${memoizedLevels[selectedGroup]?.find(g => g.id === selectedGrade)?.name || selectedGrade}`}
          </span>}
        >
          <AssignmentForm 
            courses={courses}
            teachers={teachers}
            selectedCourses={selectedCourses}
            onToggleCourse={handleToggleCourse}
            selectedTeacher={selectedTeacher}
            onTeacherChange={setSelectedTeacher}
            gradeCourses={gradeCourses}
            onAssign={handleAssign}
          />
        </PanelCard>
      )}

      <div style={{ height: '1.5rem' }} />

      {selectedGrade && !isLoading && (
        <PanelCard 
          title="Cursos Asignados Actualmente" 
          headerActions={<span>({gradeCourses.length} cursos)</span>}
          padding="0"
        >
          <AssignedCoursesTable 
            gradeCourses={gradeCourses}
            courses={courses}
            teachers={teachers}
            onRemove={removeCourseFromGrade}
          />
        </PanelCard>
      )}
    </section>
  )
}

