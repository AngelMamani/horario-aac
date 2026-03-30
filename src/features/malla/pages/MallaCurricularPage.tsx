import { useState, useMemo, useEffect } from 'react'
import Swal from 'sweetalert2'
import { useGrades } from '../../grades/hooks/useGrades'
import { useCourses } from '../../courses/hooks/useCourses'
import { useTeachers } from '../../teachers/hooks/useTeachers'
import { useGradeCourses } from '../../grades/hooks/useGradeCourses'
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
      <header className="page-header">
        <h2>Malla Curricular</h2>
        <p>Asigna cursos y docentes a cada grado y sección.</p>
      </header>

      <div className="panel-card form-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary-900)' }}>1. Seleccionar Nivel y Grado</h3>
        
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
          style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
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
      </div>

      {selectedGrade && !isLoading && (
        <div className="panel-card form-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary-900)' }}>2. Asignar Cursos y Docentes</h3>
          <p style={{ marginBottom: '1rem', color: '#666' }}>
            {selectedGroup === 'Secundaria' && selectedGrade.startsWith('Secundaria') 
              ? `Estás configurando la malla para todo el grupo: ${selectedGrade}`
              : `Configurando malla para: ${memoizedLevels[selectedGroup]?.find(g => g.id === selectedGrade)?.name || selectedGrade}`}
          </p>
          <div className="manage-group-form">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label className="modal-label" style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>Cursos (Selección Múltiple)</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#f9fafb' }}>
                  {courses.map(c => {
                    const isAssigned = gradeCourses.some(gc => gc.courseId === c.id)
                    return (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isAssigned ? 'not-allowed' : 'pointer', opacity: isAssigned ? 0.5 : 1 }}>
                        <input 
                          type="checkbox" 
                          checked={selectedCourses.includes(c.id) || isAssigned}
                          disabled={isAssigned}
                          onChange={() => handleToggleCourse(c.id)}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span style={{ fontSize: '0.95rem' }}>{c.name}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                <div style={{ flex: 1 }}>
                  <label className="modal-label" style={{ fontWeight: 'bold' }}>Docente a cargo</label>
                  <select 
                    value={selectedTeacher} 
                    onChange={e => setSelectedTeacher(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="">-- Seleccionar Docente --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                  </select>
                </div>
                <button type="button" className="btn btn--primary" onClick={() => void handleAssign()} style={{ padding: '0.8rem 1.5rem' }}>
                  Asignar Seleccionados
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedGrade && !isLoading && (
        <div className="panel-card">
          <div className="panel-card__header">
            <h3>Cursos Asignados Actualmente</h3>
            <span>({gradeCourses.length} cursos)</span>
          </div>
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
                            onClick={() => void removeCourseFromGrade(gc.id)}
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
        </div>
      )}
    </section>
  )
}
