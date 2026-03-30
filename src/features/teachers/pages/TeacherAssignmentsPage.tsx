import { useState, useMemo, useEffect } from 'react'
import { collection, onSnapshot, doc, writeBatch, query, where } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseClient'
import { useGrades } from '../../grades/hooks/useGrades'
import { useCourses } from '../../courses/hooks/useCourses'
import { useTeachers } from '../../teachers/hooks/useTeachers'
import { useGradeCourses } from '../../grades/hooks/useGradeCourses'
import { useGradesConfig } from '../../grades/hooks/useGradesConfig'
import type { GradeCourse } from '../../../shared/types/admin.types'
import { 
  UserPlus, 
  BookOpen, 
  Sparkles, 
  Users,
  Save,
  X,
  Trash2
} from 'lucide-react'
import Swal from 'sweetalert2'

type PageMode = 'general' | 'especialista'

export function TeacherAssignmentsPage() {
  const { grades, loading: gradesLoading } = useGrades()
  const { courses, loading: coursesLoading } = useCourses()
  const { teachers, loading: teachersLoading } = useTeachers()
  const { secondaryGroupNumbers } = useGradesConfig()

  const [mode, setMode] = useState<PageMode>('especialista')

  // ── General mode state (Inicial & Primaria 1ro-5to) ──
  const [generalGradeId, setGeneralGradeId] = useState('')

  // ── Specialist mode state (6to + Secundaria) ──
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedSubjectKeys, setSelectedSubjectKeys] = useState<string[]>([])
  const [subjectSearch, setSubjectSearch] = useState('')
  const [activeAssignments, setActiveAssignments] = useState<Record<string, string[]>>({}) 
  const [allSpecialistAssignments, setAllSpecialistAssignments] = useState<GradeCourse[]>([])
  const [loadingAssignments, setLoadingAssignments] = useState(false)

  // ── General mode: grades (Inicial + Primaria 1ro-5to) ──
  const generalGrades = useMemo(() => {
    return grades
      .filter(g => g.level === 'Inicial' || (g.level === 'Primaria' && !g.name.toLowerCase().includes('6to')))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  }, [grades])

  // Identificar si el grado actual es 4 o 5 años para sincronización
  const g4 = useMemo(() => generalGrades.find(g => g.name.includes('4 AÑOS')), [generalGrades])
  const g5 = useMemo(() => generalGrades.find(g => g.name.includes('5 AÑOS')), [generalGrades])
  
  const isSelected4or5 = useMemo(() => {
    const active = generalGrades.find(g => g.id === generalGradeId)
    return active?.name.includes('4 AÑOS') || active?.name.includes('5 AÑOS')
  }, [generalGradeId, generalGrades])

  const unifiedIds = useMemo(() => (g4 && g5) ? [g4.id, g5.id] : [], [g4, g5])
  const isUnifiedGrade = (id: string) => {
    const g = generalGrades.find(gr => gr.id === id)
    return g?.name.includes('4 AÑOS') || g?.name.includes('5 AÑOS')
  }

  // ── Specialist grades: 6to + Secundaria groups ──
  const specialistGrades = useMemo(() => {
    const result: { id: string; name: string; shortName: string }[] = []
    const sexto = grades.find(g => g.name.toLowerCase().includes('6to') && g.level === 'Primaria')
    if (sexto) result.push({ id: sexto.id, name: sexto.name, shortName: '6to' })

    const sorted = [...secondaryGroupNumbers].sort((a, b) => a - b)
    sorted.forEach(num => {
      result.push({ id: `Secundaria ${num}`, name: `Secundaria ${num}`, shortName: `Sec ${num}` })
    })
    return result
  }, [grades, secondaryGroupNumbers])

  // ── Specialist subjects (Grouped by Name + Level) ──
  const specialistSubjects = useMemo(() => {
    const all = courses.filter(c => c.level === 'Primaria' || c.level === 'Secundaria')
    const uniqueKeys = Array.from(new Set(all.map(c => `${c.name}|${c.level}`)))
    
    return uniqueKeys
      .map(key => {
        const [name, level] = key.split('|')
        const representative = all.find(c => c.name === name && c.level === level)!
        return { 
          name: representative.name, 
          level: representative.level,
          idKey: key,
          color: representative.color
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name) || a.level.localeCompare(b.level))
  }, [courses])

  // ── Load ALL specialist assignments ──
  useEffect(() => {
    if (!db || specialistGrades.length === 0) {
      setAllSpecialistAssignments([])
      return
    }
    setLoadingAssignments(true)
    const ids = specialistGrades.map(g => g.id)
    if (ids.length === 0) {
      setLoadingAssignments(false)
      return
    }
    const q = query(collection(db, 'gradeCourses'), where('gradeId', 'in', ids))
    const unsub = onSnapshot(q, snap => {
      setAllSpecialistAssignments(snap.docs.map(d => d.data() as GradeCourse))
      setLoadingAssignments(false)
    }, (err) => {
      console.error('Error loading assignments:', err)
      setLoadingAssignments(false)
    })
    return () => unsub()
  }, [specialistGrades])

  // ── Auto-select subjects based on teacher position ──
  useEffect(() => {
    if (!selectedTeacherId) {
      setSelectedSubjectKeys([])
      return
    }
    const teacher = teachers.find(t => t.id === selectedTeacherId)
    if (teacher?.position) {
      const pos = teacher.position.toUpperCase()
      const matches = specialistSubjects
        .filter(s => s.name.toUpperCase() === pos || pos.includes(s.name.toUpperCase()))
        .map(s => s.idKey)
      
      if (matches.length > 0) {
        setSelectedSubjectKeys(matches)
      }
    }
  }, [selectedTeacherId, teachers, specialistSubjects])

  // ── Sync activeAssignments ──
  useEffect(() => {
    setActiveAssignments(prev => {
      const next: Record<string, string[]> = {}
        selectedSubjectKeys.forEach(idKey => {
          if (prev[idKey]) {
            next[idKey] = prev[idKey]
          } else {
            const [, level] = idKey.split('|')
            next[idKey] = specialistGrades
            .filter(g => {
              if (g.id.includes('Secundaria')) return level === 'Secundaria'
              if (g.shortName === '6to') return level === 'Primaria'
              return false
            })
            .map(g => g.id)
        }
      })
      return next
    })
  }, [selectedSubjectKeys, specialistGrades])

  const toggleAssignment = (subjectKey: string, gradeId: string) => {
    setActiveAssignments(prev => {
      const current = prev[subjectKey] || []
      const next = current.includes(gradeId)
        ? current.filter(id => id !== gradeId)
        : [...current, gradeId]
      return { ...prev, [subjectKey]: next }
    })
  }

  const totalAssignmentsCount = useMemo(() => {
    return Object.values(activeAssignments).reduce((sum, ids) => sum + ids.length, 0)
  }, [activeAssignments])

  // ── General mode hook ──
  const effectiveId = (isSelected4or5 && g4) ? g4.id : generalGradeId
  const { gradeCourses: generalGradeCourses, assignCourseToGrade, loading: generalLoading } = useGradeCourses(effectiveId || null)

  // ── Specialist: bulk save ──
  const handleSpecialistSave = async () => {
    if (!db || !selectedTeacherId || selectedSubjectKeys.length === 0) return

    const teacherName = teachers.find(t => t.id === selectedTeacherId)?.fullName
    const result = await Swal.fire({
      title: '¿Confirmar asignación?',
      html: `Se realizarán <strong>${totalAssignmentsCount}</strong> asignaciones para <strong>${teacherName}</strong>.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, asignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0891b2'
    })

    if (!result.isConfirmed) return

    const batch = writeBatch(db!)
    try {
      selectedSubjectKeys.forEach(idKey => {
        const [name, level] = idKey.split('|')
        const gradeIds = activeAssignments[idKey] || []
        const correctCourse = courses.find(c => c.name === name && c.level === level)

        if (!correctCourse) return

        gradeIds.forEach(gradeId => {
          const id = `${gradeId}_${correctCourse.id}`
          const ref = doc(db!, 'gradeCourses', id)
          batch.set(ref, { id, gradeId, courseId: correctCourse.id, teacherId: selectedTeacherId })
        })
      })
      await batch.commit()
      
      setSelectedSubjectKeys([])
      setSelectedTeacherId('')
      void Swal.fire({ title: '¡Asignación completada!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 })
    } catch (error) {
      console.error('Error in specialist save:', error)
      void Swal.fire({ title: 'Error al guardar', text: 'No se pudo completar la asignación masiva.', icon: 'error' })
    }
  }

  // ── General: bulk assign ──
  const handleGeneralMasiva = async () => {
    if (!generalGradeId) return
    const { value: teacherId } = await Swal.fire({
      title: 'Asignación Masiva',
      text: 'Selecciona el docente responsable del grado:',
      input: 'select',
      inputOptions: Object.fromEntries(teachers.map(t => [t.id, t.fullName])),
      inputPlaceholder: '-- Seleccionar Docente --',
      showCancelButton: true,
      confirmButtonText: 'Siguiente',
      confirmButtonColor: 'var(--color-primary-800)'
    })

    if (!teacherId) return
    const grade = grades.find(g => g.id === (isSelected4or5 && g4 ? g4.id : generalGradeId))
    const levelCourses = courses.filter(c => grade && c.level === grade.level)
    
    const specialistKeywords = ['INGLES', 'COMPUTACION', 'EDUCACION FISICA', 'TUTORIA', 'PSICOMOTRICIDAD']
    const optionsHtml = levelCourses.map(c => {
      const assignment = generalGradeCourses.find(gc => gc.courseId === c.id)
      const isSpecialist = specialistKeywords.some(key => c.name.toUpperCase().includes(key))
      const currentTeacher = assignment ? teachers.find(t => t.id === assignment.teacherId)?.fullName : null
      
      return `
        <div style="text-align: left; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 10px; font-size: 0.85rem; padding: 0.4rem; border-radius: 6px; background: ${assignment ? '#f8fafc' : 'transparent'}">
          <input type="checkbox" id="course-${c.id}" value="${c.id}" 
            ${assignment ? 'disabled' : ''} 
            ${!assignment && !isSpecialist ? 'checked' : ''} 
            style="width: 18px; height: 18px;">
          <div style="flex: 1;">
            <label style="font-weight: 500; color: ${assignment ? '#94a3b8' : '#1e293b'}">${c.name}</label>
            ${currentTeacher ? `<div style="font-size: 0.7rem; color: #0891b2;">Asignado a: ${currentTeacher}</div>` : ''}
          </div>
        </div>
      `
    }).join('')

    const swalResult = await Swal.fire({
      title: 'Materias a Asignar',
      html: `
        <div style="margin-bottom: 1rem;">
          <button id="toggle-exception" class="swal2-confirm swal2-styled" style="background: #64748b; font-size: 0.7rem; padding: 0.4rem 0.8rem;">
            Habilitar Sobrescritura (Excepción)
          </button>
        </div>
        <div id="course-list-container" style="max-height: 280px; overflow-y: auto; text-align: left; border: 1px solid #f1f5f9; padding: 10px; border-radius: 8px;">
          ${optionsHtml}
        </div>
      `,
      didOpen: () => {
        const btn = document.getElementById('toggle-exception')
        btn?.addEventListener('click', () => {
          document.querySelectorAll('#course-list-container input[type="checkbox"]').forEach((cb: any) => {
            (cb as HTMLInputElement).disabled = false
          })
          btn.style.display = 'none'
        })
      },
      showCancelButton: true,
      confirmButtonText: 'Finalizar Asignación',
      confirmButtonColor: 'var(--color-primary-800)',
      preConfirm: () => {
        const checked: string[] = []
        document.querySelectorAll('#course-list-container input[type="checkbox"]:checked').forEach((cb: any) => {
          checked.push((cb as HTMLInputElement).value)
        })
        return checked
      }
    })

    const selectedCids = swalResult.value as string[]
    if (!selectedCids || selectedCids.length === 0) return
    
    try {
      const targets = isSelected4or5 ? unifiedIds : [generalGradeId]
      const promises: Promise<any>[] = []
      
      targets.forEach(gid => {
        selectedCids.forEach((cid: string) => {
          promises.push(assignCourseToGrade(gid, cid, teacherId))
        })
      })

      await Promise.all(promises)
      void Swal.fire({ title: '¡Asignación completada!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    } catch (error) {
      console.error('Error in general masiva:', error)
      void Swal.fire({ title: 'Error', text: 'Ocurrió un problema al guardar masivamente.', icon: 'error' })
    }
  }

  const handleUnassign = async (gradeId: string, courseId: string, teacherName: string, courseName: string) => {
    const result = await Swal.fire({
      title: '¿Quitar asignación?',
      html: `Deseas desvincular a <strong>${teacherName}</strong> de <strong>${courseName}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desvincular',
      confirmButtonColor: '#ef4444'
    })

    if (!result.isConfirmed) return
    
    try {
      const targets = isSelected4or5 ? unifiedIds : [gradeId]
      const batch = writeBatch(db!)
      targets.forEach(gid => {
        batch.delete(doc(db!, 'gradeCourses', `${gid}_${courseId}`))
      })
      await batch.commit()
      void Swal.fire({ title: 'Asignación eliminada', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    } catch (err) {
      console.error('Error unassigning:', err)
    }
  }

  const handleClearAllGeneral = async () => {
    if (!generalGradeId) return
    const result = await Swal.fire({
      title: '¿Limpiar Todo?',
      text: 'Se borrarán todas las asignaciones de este grupo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar todo',
      confirmButtonColor: '#ef4444'
    })
    if (!result.isConfirmed) return
    
    try {
      const targets = isSelected4or5 ? unifiedIds : [generalGradeId]
      const batch = writeBatch(db!)
      
      generalGradeCourses.forEach(gc => {
        targets.forEach(gid => {
          batch.delete(doc(db!, 'gradeCourses', `${gid}_${gc.courseId}`))
        })
      })
      
      await batch.commit()
      void Swal.fire({ title: '¡Limpiado!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    } catch (err) {
      console.error('Error clearing:', err)
    }
  }

  const handleClearAllSpecialists = async () => {
    const result = await Swal.fire({
      title: '¿RESETEAR TODO EL RESUMEN?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'SÍ, BORRADO TOTAL',
      confirmButtonColor: '#ff0000'
    })
    if (!result.isConfirmed) return
    try {
      const batch = writeBatch(db!)
      allSpecialistAssignments.forEach(a => batch.delete(doc(db!, 'gradeCourses', a.id)))
      await batch.commit()
      void Swal.fire({ title: 'Resumen reseteado', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
    } catch (err) {
      console.error('Error clearing specialists:', err)
    }
  }

  if (gradesLoading || coursesLoading || teachersLoading) {
    return <section className="page-header"><h2>Cargando...</h2></section>
  }

  return (
    <section>
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--color-primary-800)', color: '#fff', padding: '0.8rem', borderRadius: '12px' }}>
            <UserPlus size={24} />
          </div>
          <div>
            <h2>Asignación de Docentes</h2>
            <p>Define quién dicta cada curso según el nivel y grado escolar.</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', paddingBottom: '2px' }}>
        <button
          onClick={() => setMode('especialista')}
          style={{
            padding: '0.8rem 1.5rem', borderRadius: '10px 10px 0 0', border: 'none',
            background: mode === 'especialista' ? '#0891b2' : 'transparent',
            color: mode === 'especialista' ? '#fff' : '#64748b',
            fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.9rem'
          }}
        >
          Especialistas (6to + Sec)
        </button>
        <button
          onClick={() => setMode('general')}
          style={{
            padding: '0.8rem 1.5rem', borderRadius: '10px 10px 0 0', border: 'none',
            background: mode === 'general' ? 'var(--color-primary-800)' : 'transparent',
            color: mode === 'general' ? '#fff' : '#64748b',
            fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.9rem'
          }}
        >
          Inicial & Primaria
        </button>
      </div>

      {mode === 'especialista' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="panel-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
              <Users size={18} color="#0891b2" /> Paso 1 — Seleccionar Docente
            </h4>
            <select
              value={selectedTeacherId}
              onChange={e => { setSelectedTeacherId(e.target.value); setSelectedSubjectKeys([]); setSubjectSearch('') }}
              style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
            >
              <option value="">-- Elegir docente --</option>
              {teachers
                .filter(t => !t.id.includes('años'))
                .sort((a,b) => a.fullName.localeCompare(b.fullName))
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} {t.position ? `(${t.position})` : ''}
                  </option>
                ))
              }
            </select>
          </div>

          {selectedTeacherId && (
            <div className="panel-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#334155' }}>
                  <BookOpen size={18} color="#0891b2" /> Paso 2 — Marcar Materias
                </h4>
                <input 
                  type="text" 
                  placeholder="Buscar materia..." 
                  value={subjectSearch}
                  onChange={e => setSubjectSearch(e.target.value)}
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', width: '200px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto', padding: '0.8rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                {specialistSubjects
                  .filter(s => s.name.toLowerCase().includes(subjectSearch.toLowerCase()))
                  .map(subject => {
                    const isSelected = selectedSubjectKeys.includes(subject.idKey)
                    const assignmentsWithKey = allSpecialistAssignments.filter(a => {
                      const c = courses.find(cc => cc.id === a.courseId)
                      return c?.name === subject.name && c?.level === subject.level
                    })
                    const otherTeachers = Array.from(new Set(assignmentsWithKey.map(a => a.teacherId))).filter(tid => tid !== selectedTeacherId)
                    
                    return (
                      <label
                        key={subject.idKey}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          padding: '0.5rem 0.7rem',
                          background: isSelected ? '#ecfdf5' : '#fff',
                          borderRadius: '8px',
                          border: `1px solid ${isSelected ? '#86efac' : '#f1f5f9'}`,
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={e => {
                            if (e.target.checked) setSelectedSubjectKeys(prev => [...prev, subject.idKey])
                            else setSelectedSubjectKeys(prev => prev.filter(k => k !== subject.idKey))
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {subject.name}
                            <span style={{ fontSize: '0.6rem', color: '#94a3b8', background: '#f1f5f9', padding: '1px 4px', borderRadius: '3px' }}>
                              {subject.level === 'Primaria' ? 'PRI' : 'SEC'}
                            </span>
                          </span>
                          {otherTeachers.length > 0 && (
                            <div style={{ fontSize: '0.6rem', color: '#ea580c' }}> {otherTeachers.length} ya asignado(s) </div>
                          )}
                        </div>
                      </label>
                    )
                  })}
              </div>
            </div>
          )}

          {selectedSubjectKeys.length > 0 && (
            <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="panel-card__header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Paso 3 — Elegir Grados para cada Materia</h4>
                <span style={{ fontSize: '0.8rem', color: '#0891b2', fontWeight: 'bold' }}> {totalAssignmentsCount} asignaciones </span>
              </div>
              <div className="table-wrapper" style={{ margin: 0 }}>
                <table style={{ minWidth: '400px' }}>
                  <thead>
                    <tr>
                      <th>Materia</th>
                      {specialistGrades.map(g => <th key={g.id} style={{ textAlign: 'center' }}>{g.shortName}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {[...selectedSubjectKeys].sort().map(idKey => {
                      const [name, level] = idKey.split('|')
                      const subject = specialistSubjects.find(s => s.idKey === idKey)
                      const assignedGrades = activeAssignments[idKey] || []
                      return (
                        <tr key={idKey}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: subject?.color || '#94a3b8' }} />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ fontSize: '0.8rem' }}>{name}</strong>
                                <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{level}</span>
                              </div>
                            </div>
                          </td>
                          {specialistGrades.map(g => (
                            <td key={g.id} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleAssignment(idKey, g.id)}>
                              <input type="checkbox" checked={assignedGrades.includes(g.id)} onChange={() => {}} />
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn--primary"
                  onClick={() => void handleSpecialistSave()}
                  style={{ background: '#0891b2', padding: '0.7rem 1.8rem', fontWeight: 'bold', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Save size={16} /> Confirmar {totalAssignmentsCount} Asignaciones
                </button>
              </div>
            </div>
          )}

          <div className="panel-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="panel-card__header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Resumen de Asignaciones Actuales</h4>
              {allSpecialistAssignments.length > 0 && (
                <button onClick={() => void handleClearAllSpecialists()} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                   Limpiar Todo
                </button>
              )}
            </div>
            <div className="table-wrapper" style={{ margin: 0 }}>
              <table style={{ minWidth: '450px' }}>
                <thead>
                  <tr>
                    <th>Materia</th>
                    {specialistGrades.map(g => <th key={g.id} style={{ textAlign: 'center' }}>{g.shortName}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {loadingAssignments ? (
                    <tr><td colSpan={specialistGrades.length + 1} style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</td></tr>
                  ) : (
                    specialistSubjects.map(subject => {
                      const hasAny = specialistGrades.some(g =>
                        allSpecialistAssignments.some(a => {
                          const c = courses.find(cc => cc.id === a.courseId)
                          return c?.name === subject.name && c?.level === subject.level && a.gradeId === g.id
                        })
                      )
                      return (
                        <tr key={subject.idKey} style={{ opacity: hasAny ? 1 : 0.45 }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: subject.color || '#e2e8f0' }} />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.8rem' }}>{subject.name}</span>
                                <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{subject.level}</span>
                              </div>
                            </div>
                          </td>
                          {specialistGrades.map(g => {
                            const assignment = allSpecialistAssignments.find(a => {
                               const c = courses.find(cc => cc.id === a.courseId)
                               return c?.name === subject.name && c?.level === subject.level && a.gradeId === g.id
                            })
                            const teacher = assignment ? teachers.find(t => t.id === assignment.teacherId) : null
                            return (
                              <td key={g.id} style={{ textAlign: 'center', fontSize: '0.7rem' }}>
                                {teacher ? (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    <span>{teacher.fullName.split(' ').slice(0, 2).join(' ')}</span>
                                    <button onClick={() => void handleUnassign(g.id, assignment!.courseId, teacher.fullName, subject.name)} style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}><X size={12} /></button>
                                  </div>
                                ) : '---'}
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="panel-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ margin: '0 0 0.8rem', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}> <Users size={16} /> Seleccionar Grado </h4>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {generalGrades.map(g => {
                const isGrouped = isSelected4or5 && isUnifiedGrade(g.id)
                const isActive = g.id === generalGradeId || isGrouped
                return (
                  <button
                    key={g.id}
                    onClick={() => setGeneralGradeId(g.id)}
                    style={{
                      padding: '0.5rem 1.25rem', borderRadius: '20px', whiteSpace: 'nowrap',
                      fontSize: '0.85rem', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                      background: isActive ? 'var(--color-primary-800)' : '#f1f5f9',
                      color: isActive ? '#fff' : '#475569',
                      position: 'relative'
                    }}
                  > 
                    {g.name} 
                    {isUnifiedGrade(g.id) && (
                      <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#0891b2', color: '#fff', fontSize: '0.55rem', padding: '1px 4px', borderRadius: '4px' }}>
                        UNI
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {generalGradeId && (
            <div className="panel-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>Cursos de {generalGrades.find(g => g.id === generalGradeId)?.name}</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn--primary btn--small" onClick={() => void handleGeneralMasiva()}> <Sparkles size={14} /> Masiva </button>
                  {generalGradeCourses.length > 0 && (
                    <button className="btn btn--danger btn--small" onClick={() => void handleClearAllGeneral()}> <Trash2 size={14} /> Limpiar </button>
                  )}
                </div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Curso</th><th>Docente</th><th>Acción</th></tr></thead>
                  <tbody>
                    {generalLoading ? ( <tr><td colSpan={3}>Cargando...</td></tr> ) : generalGradeCourses.length === 0 ? ( <tr><td colSpan={3}>Sin asignaciones.</td></tr> ) : (
                      generalGradeCourses.map(gc => {
                        const course = courses.find(c => c.id === gc.courseId)
                        const teacherName = teachers.find(t => t.id === gc.teacherId)?.fullName || '---'
                        return (
                          <tr key={gc.id}>
                            <td><strong>{course?.name}</strong> <span style={{fontSize:'0.7rem', color:'#94a3b8'}}>({course?.level})</span></td>
                            <td>{teacherName}</td>
                            <td>
                              <button onClick={() => void handleUnassign(gc.gradeId, gc.courseId, teacherName, course?.name || '')} style={{ border: 'none', background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}> Quitar </button>
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
        </div>
      )}
    </section>
  )
}
