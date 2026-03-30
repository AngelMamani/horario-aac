import { useState, useMemo } from 'react'
import Swal from 'sweetalert2'
import { useCourses } from '../hooks/useCourses'
import type { Course } from '../../../shared/types/admin.types'
import { Sparkles, Trash2, Edit3, Palette } from 'lucide-react'

const COURSE_PALETTE = [
  '#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#fef08a', '#fb7185', '#94a3b8', '#9ca3af', '#f9a8d4', '#fda4af'
]

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

export function CoursesPage() {
  const { courses, loading, addCourse, deleteCourse, updateCourse } = useCourses()
  const [name, setName] = useState('')
  const [level, setLevel] = useState<Course['level']>('Primaria')
  const [selectedColor, setSelectedColor] = useState(COURSE_PALETTE[0])
  const [activeTab, setActiveTab] = useState<Course['level']>('Primaria')

  const filteredCourses = useMemo(() => {
    return courses.filter(c => c.level === activeTab)
  }, [courses, activeTab])

  // Get a random color from the palette, trying to avoid repetition in current level
  const pickSmartRandomColor = (existingCourses: Course[]) => {
    const activeColors = new Set(existingCourses.map(c => c.color))
    const availableColors = COURSE_PALETTE.filter(c => !activeColors.has(c))
    
    if (availableColors.length > 0) {
        return availableColors[Math.floor(Math.random() * availableColors.length)]
    }
    // If all used, just random
    return COURSE_PALETTE[Math.floor(Math.random() * COURSE_PALETTE.length)]
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim().toUpperCase()
    if (!trimmedName) {
      showToast('error', 'Ingresa el nombre del curso')
      return
    }

    const alreadyExists = courses.some(c => c.name === trimmedName && c.level === level)
    if (alreadyExists) {
      showToast('warning', `El curso ${trimmedName} ya existe en ${level}`)
      return
    }

    // If the user didn't manually pick, or just to ensure uniqueness
    const finalColor = selectedColor || pickSmartRandomColor(courses.filter(lc => lc.level === level))

    await addCourse({ 
      name: trimmedName,
      level: level,
      color: finalColor
    })

    showToast('success', 'Curso añadido')
    setName('')
    // Set next random color for the next addition
    setSelectedColor(pickSmartRandomColor(courses.filter(lc => lc.level === level)))
  }

  const handleAutoColorLevel = async () => {
    const targetCourses = courses.filter(c => c.level === activeTab)
    if (targetCourses.length === 0) return

    const result = await Swal.fire({
      title: 'Auto-Colorear Nivel',
      text: `¿Deseas asignar colores aleatorios únicos a todos los cursos de ${activeTab}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aplicar colores',
      confirmButtonColor: '#0e4a7f'
    })

    if (!result.isConfirmed) return

    // Shuffled palette
    let availablePalette = [...COURSE_PALETTE].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < targetCourses.length; i++) {
        // Reuse palette if courses > palette length
        const color = availablePalette[i % availablePalette.length]
        await updateCourse(targetCourses[i].id, { color })
    }

    showToast('success', 'Colores asignados aleatoriamente')
  }

  const handleDelete = async (id: string, courseName: string) => {
    const result = await Swal.fire({
      title: 'Eliminar curso',
      text: `¿Estás seguro de eliminar ${courseName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      confirmButtonColor: '#c03d3d'
    })
    if (result.isConfirmed) {
      await deleteCourse(id)
      showToast('success', 'Curso eliminado')
    }
  }

  const handleEdit = async (id: string, course: Course) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Curso',
      html: `
        <label>Nombre</label>
        <input id="swal-input1" class="swal2-input" value="${course.name}" style="text-transform: uppercase">
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          name: (document.getElementById('swal-input1') as HTMLInputElement).value.toUpperCase()
        }
      }
    })

    if (formValues && formValues.name.trim()) {
      await updateCourse(id, { name: formValues.name.trim() })
      showToast('success', 'Actualizado')
    }
  }

  return (
    <section>
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Palette size={24} color="var(--color-primary-700)" />
          <div>
            <h2>Cursos Institucionales</h2>
            <p>Gestiona el catálogo de materias y sus colores identificadores.</p>
          </div>
        </div>
      </header>

      <div className="panel-card form-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary-900)' }}>Rápido: Añadir Curso</h3>
        <form className="admin-form" onSubmit={(e) => void handleAddCourse(e)} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 100px auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label className="modal-label">Nombre</label>
            <input type="text" placeholder="EJ. COMUNICACIÓN" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} />
          </div>
          <div>
            <label className="modal-label">Nivel</label>
            <select value={level} onChange={(e) => setLevel(e.target.value as any)}>
              <option value="Inicial">Inicial</option>
              <option value="Primaria">Primaria</option>
              <option value="Secundaria">Secundaria</option>
            </select>
          </div>
          <div>
            <label className="modal-label">Color</label>
            <div 
              onClick={() => setSelectedColor(pickSmartRandomColor(courses.filter(c => c.level === level)))}
              style={{ width: '100%', height: '42px', background: selectedColor, borderRadius: '6px', cursor: 'pointer', border: '1px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Click para cambiar aleatoriamente"
            >
              <Sparkles size={16} color="#fff" />
            </div>
          </div>
          <button type="submit" className="btn btn--primary" style={{ padding: '0.8rem 1.5rem' }}>Añadir</button>
        </form>
      </div>

      <div className="panel-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0' }}>
               {['Inicial', 'Primaria', 'Secundaria'].map((lvl) => (
                  <button 
                    key={lvl} 
                    onClick={() => setActiveTab(lvl as any)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: activeTab === lvl ? 'var(--color-primary-800)' : '#f1f5f9',
                      color: activeTab === lvl ? '#fff' : '#475569',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {lvl}
                  </button>
               ))}
            </div>
            
            <button className="btn btn--small" onClick={() => void handleAutoColorLevel()} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--color-primary-600)', fontWeight: 'bold' }}>
                <Sparkles size={14} style={{ marginRight: '6px' }} />
                Auto-Colorear Nivel
            </button>
        </div>

        <div className="table-wrapper">
          {loading ? (
             <p style={{ padding: '2rem', textAlign: 'center' }}>Cargando cursos...</p>
          ) : (
             <table>
               <thead>
                 <tr>
                   <th style={{ width: '60px' }}>Color</th>
                   <th>Materia / Curso</th>
                   <th>Otros Niveles</th>
                   <th style={{ width: '150px', textAlign: 'center' }}>Acciones</th>
                 </tr>
               </thead>
               <tbody>
                 {filteredCourses.length === 0 ? (
                   <tr>
                     <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No hay cursos en este nivel.</td>
                   </tr>
                 ) : (
                   filteredCourses.map((course) => {
                     const otherLevels = courses.filter(c => c.name === course.name && c.level !== activeTab).map(c => c.level)
                     return (
                       <tr key={course.id}>
                         <td style={{ textAlign: 'center' }}>
                            <div 
                                style={{ width: '28px', height: '28px', borderRadius: '50%', background: course.color || '#cbd5e1', border: '2px solid #fff', boxShadow: '0 0 0 1px #eee' }} 
                                onClick={() => {
                                    const c = pickSmartRandomColor(courses.filter(lc => lc.level === activeTab));
                                    void updateCourse(course.id, { color: c });
                                }}
                                title="Click para cambiar color"
                            />
                         </td>
                         <td style={{ fontWeight: '700' }}>{course.name}</td>
                         <td>
                            <div style={{ display: 'flex', gap: '0.3rem' }}>
                                {otherLevels.map(lvl => <span key={lvl} style={{ fontSize: '0.65rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{lvl}</span>)}
                            </div>
                         </td>
                         <td>
                           <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                             <button className="btn btn--small" style={{ padding: '0.4rem' }} onClick={() => void handleEdit(course.id, course)}><Edit3 size={14}/></button>
                             <button className="btn btn--small btn--danger" style={{ padding: '0.4rem' }} onClick={() => void handleDelete(course.id, course.name)}><Trash2 size={14}/></button>
                           </div>
                         </td>
                       </tr>
                     )
                   })
                 )}
               </tbody>
             </table>
          )}
        </div>
      </div>
    </section>
  )
}
