import { useState, useMemo } from 'react'
import Swal from 'sweetalert2'
import { useCourses } from '../hooks/useCourses'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PanelCard } from '../../../shared/components/PanelCard'
import { CourseForm } from '../components/CourseForm'
import { CourseTable } from '../components/CourseTable'
import { Palette, Sparkles } from 'lucide-react'
import type { Course } from '../../../shared/types/admin.types'

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

  const pickSmartRandomColor = (existingCourses: Course[]) => {
    const activeColors = new Set(existingCourses.map(c => c.color))
    const availableColors = COURSE_PALETTE.filter(c => !activeColors.has(c))
    if (availableColors.length > 0) {
        return availableColors[Math.floor(Math.random() * availableColors.length)]
    }
    return COURSE_PALETTE[Math.floor(Math.random() * COURSE_PALETTE.length)]
  }

  const filteredCourses = useMemo(() => {
    return courses.filter(c => c.level === activeTab)
  }, [courses, activeTab])

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

    const finalColor = selectedColor || pickSmartRandomColor(courses.filter(lc => lc.level === level))

    await addCourse({ 
      name: trimmedName,
      level: level,
      color: finalColor
    })

    showToast('success', 'Curso añadido')
    setName('')
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
    let availablePalette = [...COURSE_PALETTE].sort(() => Math.random() - 0.5)
    
    for (let i = 0; i < targetCourses.length; i++) {
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
        <label style="display:block;margin-bottom:5px;font-size:0.8rem;color:#64748b;text-align:left;">Nombre</label>
        <input id="swal-input1" class="swal2-input" value="${course.name}" style="text-transform: uppercase; margin-top: 0;">
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
      <PageHeader 
        title="Cursos Institucionales" 
        subtitle="Gestiona el catálogo de materias y sus colores identificadores."
        icon={Palette}
      />

      <PanelCard title="Rápido: Añadir Curso">
        <CourseForm 
          name={name}
          onNameChange={setName}
          level={level}
          onLevelChange={setLevel}
          selectedColor={selectedColor}
          onPickColor={() => setSelectedColor(pickSmartRandomColor(courses.filter(c => c.level === level)))}
          onSubmit={handleAddCourse}
        />
      </PanelCard>

      <div style={{ height: '1.5rem' }} />

      <PanelCard 
        headerActions={
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['Inicial', 'Primaria', 'Secundaria'].map((lvl) => (
                <button 
                  key={lvl} 
                  onClick={() => setActiveTab(lvl as any)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: activeTab === lvl ? 'var(--color-primary-800)' : '#f1f5f9',
                    color: activeTab === lvl ? '#fff' : '#475569',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <button className="btn btn--small" onClick={() => void handleAutoColorLevel()} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--color-primary-600)', fontWeight: 'bold' }}>
              <Sparkles size={14} style={{ marginRight: '6px' }} />
              Auto-Colorear
            </button>
          </div>
        }
        padding="0"
      >
        <CourseTable 
           filteredCourses={filteredCourses}
           allCourses={courses}
           activeTab={activeTab}
           onPickSmartColor={pickSmartRandomColor}
           updateCourse={updateCourse}
           onEdit={handleEdit}
           onDelete={handleDelete}
           loading={loading}
        />
      </PanelCard>
    </section>
  )
}
