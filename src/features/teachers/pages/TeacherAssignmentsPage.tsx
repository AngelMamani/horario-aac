import { useState, useMemo, useEffect } from 'react'
import { collection, onSnapshot, doc, writeBatch, query, where } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseClient'
import { useGrades } from '../../grades/hooks/useGrades'
import { useCourses } from '../../courses/hooks/useCourses'
import { useTeachers } from '../../teachers/hooks/useTeachers'
import { useGradeCourses } from '../../grades/hooks/useGradeCourses'
import { useGradesConfig } from '../../grades/hooks/useGradesConfig'
import type { GradeCourse } from '../../../shared/types/admin.types'
import { UserPlus } from 'lucide-react'
import Swal from 'sweetalert2'
import { SpecialistView } from '../components/SpecialistView'
import { GeneralView } from '../components/GeneralView'

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
    return !!(active?.name.includes('4 AÑOS') || active?.name.includes('5 AÑOS'))
  }, [generalGradeId, generalGrades])

  const unifiedIds = useMemo(() => (g4 && g5) ? [g4.id, g5.id] : [], [g4, g5])
  const isUnifiedGrade = (id: string) => {
    const g = generalGrades.find(gr => gr.id === id)
    return !!(g?.name.includes('4 AÑOS') || g?.name.includes('5 AÑOS'))
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
        <SpecialistView 
          teachers={teachers}
          selectedTeacherId={selectedTeacherId}
          onTeacherChange={(id) => { setSelectedTeacherId(id); setSelectedSubjectKeys([]); setSubjectSearch('') }}
          specialistSubjects={specialistSubjects}
          subjectSearch={subjectSearch}
          onSubjectSearchChange={setSubjectSearch}
          selectedSubjectKeys={selectedSubjectKeys}
          onSubjectToggle={(key, checked) => {
            if (checked) setSelectedSubjectKeys(prev => [...prev, key])
            else setSelectedSubjectKeys(prev => prev.filter(k => k !== key))
          }}
          allSpecialistAssignments={allSpecialistAssignments}
          courses={courses}
          specialistGrades={specialistGrades}
          activeAssignments={activeAssignments}
          onToggleAssignment={toggleAssignment}
          totalAssignmentsCount={totalAssignmentsCount}
          onSave={handleSpecialistSave}
          onClearAll={handleClearAllSpecialists}
          onUnassign={handleUnassign}
          loadingAssignments={loadingAssignments}
        />
      ) : (
        <GeneralView 
          generalGrades={generalGrades}
          generalGradeId={generalGradeId}
          onGradeChange={setGeneralGradeId}
          isUnifiedGrade={isUnifiedGrade}
          isSelected4or5={isSelected4or5}
          onGeneralMasiva={handleGeneralMasiva}
          onClearAll={handleClearAllGeneral}
          generalLoading={generalLoading}
          generalGradeCourses={generalGradeCourses}
          courses={courses}
          teachers={teachers}
          onUnassign={handleUnassign}
        />
      )}
    </section>
  )
}
