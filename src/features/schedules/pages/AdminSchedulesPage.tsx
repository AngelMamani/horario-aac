import { useState, useMemo } from 'react'
import { useGrades } from '../../grades/hooks/useGrades'
import { useGradesConfig } from '../../grades/hooks/useGradesConfig'
import { useSchedule } from '../hooks/useSchedule'
import { useCourses } from '../../courses/hooks/useCourses'
import { useTeachers } from '../../teachers/hooks/useTeachers'
import { Calendar, BookOpen, AlertCircle, Info, UserCheck } from 'lucide-react'

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']

const PRIMARIA_SEC_HOURS = [
  { label: '1° Hora', time: '07:20 - 08:05', type: 'class', index: 1 },
  { label: '2° Hora', time: '08:05 - 08:50', type: 'class', index: 2 },
  { label: '3° Hora', time: '08:50 - 09:35', type: 'class', index: 3 },
  { label: '4° Hora', time: '09:35 - 10:20', type: 'class', index: 4 },
  { label: 'RECREO', time: '10:20 - 11:00', type: 'break', index: -1 },
  { label: '5° Hora', time: '11:00 - 11:45', type: 'class', index: 5 },
  { label: '6° Hora', time: '11:45 - 12:30', type: 'class', index: 6 },
  { label: '7° Hora', time: '12:30 - 13:15', type: 'class', index: 7 },
  { label: '8° Hora', time: '13:15 - 14:00', type: 'class', index: 8 },
]

const INICIAL_HOURS = [
  { label: '1° Hora', time: '08:00 - 08:30', type: 'class', index: 1 },
  { label: '2° Hora', time: '08:30 - 09:10', type: 'class', index: 2 },
  { label: '3° Hora', time: '09:10 - 09:40', type: 'class', index: 3 },
  { label: 'RECREO', time: '09:40 - 10:10', type: 'break', index: -1 },
  { label: 'Actividad', time: '10:10 - 10:15', type: 'break', index: -2 },
  { label: '4° Hora', time: '10:15 - 11:05', type: 'class', index: 4 },
  { label: '5° Hora', time: '11:05 - 11:45', type: 'class', index: 5 },
  { label: '6° Hora', time: '11:45 - 12:30', type: 'class', index: 6 },
]

export function AdminSchedulesPage() {
  const { grades, loading: loadingGrades } = useGrades()
  const { secondaryGroupNumbers, loadingConfig } = useGradesConfig()
  const { courses, loading: loadingCourses } = useCourses()
  const { teachers, loading: loadingTeachers } = useTeachers()
  
  const [activeTab, setActiveTab] = useState<'Inicial' | 'Primaria' | 'Secundaria'>('Primaria')
  const [selectedTargetId, setSelectedTargetId] = useState<string>('')
  
  const memoizedTargetsByLevel = useMemo(() => {
    const map: Record<string, { id: string; name: string; level: string }[]> = {
      Inicial: [],
      Primaria: [],
      Secundaria: []
    }
    
    // Group 4 and 5 years for Inicial
    const inicialGrades = grades.filter(g => g.level === 'Inicial')
    const has4Anos = inicialGrades.some(g => g.name === '4 años')
    const has5Anos = inicialGrades.some(g => g.name === '5 años')

    if (has4Anos || has5Anos) {
      map.Inicial.push({ id: 'inicial-4-5-shared', name: 'Inicial 4 y 5 años', level: 'Inicial' })
    }

    inicialGrades.forEach(g => {
        if (g.name !== '4 años' && g.name !== '5 años') {
            map.Inicial.push({ id: g.id, name: g.name, level: 'Inicial' })
        }
    })

    // Primaria
    grades.forEach(g => {
        if (g.level === 'Primaria') {
            map.Primaria.push({ id: g.id, name: g.name, level: 'Primaria' })
        }
    })

    // Secundaria Groups only
    const sortedGroups = [...secondaryGroupNumbers].sort((a, b) => a - b)
    sortedGroups.forEach(num => {
      map.Secundaria.push({ id: `Secundaria ${num}`, name: `Secundaria ${num}`, level: 'Secundaria' })
    })

    // Sort names numerically (Secundaria 1, 2, 10...)
    Object.keys(map).forEach(key => 
        map[key].sort((a,b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }))
    )
    return map
  }, [grades, secondaryGroupNumbers])

  const currentLevelTargets = memoizedTargetsByLevel[activeTab] || []
  const activeTargetId = selectedTargetId || (currentLevelTargets.length > 0 ? currentLevelTargets[0].id : '')
  const activeTarget = currentLevelTargets.find(t => t.id === activeTargetId)

  const { scheduleData, tutorId, loadingSchedule, updateScheduleItem, updateTutor } = useSchedule(activeTargetId)

  const normalizedTargetName = activeTarget?.name.toLowerCase() || ''
  const is6toPrimaria = normalizedTargetName.includes('6to') && normalizedTargetName.includes('primaria')

  const levelCatalogCourses = useMemo(() => {
    let filtered = courses.filter(c => c.level === activeTab)
    
    // Special rule: 6to Primaria can also use Secundaria courses
    if (is6toPrimaria) {
        const secondaryCourses = courses.filter(c => c.level === 'Secundaria')
        filtered = [...filtered, ...secondaryCourses]
    }

    return filtered.sort((a,b) => a.name.localeCompare(b.name))
  }, [courses, activeTab, is6toPrimaria])

  const hours = activeTab === 'Inicial' ? INICIAL_HOURS : PRIMARIA_SEC_HOURS

  if (loadingGrades || loadingConfig || loadingCourses || loadingTeachers) {
    return <section className="page-header"><h2>Cargando Editor...</h2></section>
  }

  return (
    <section>
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'var(--color-primary-800)', color: '#fff', padding: '0.8rem', borderRadius: '12px' }}>
                <Calendar size={24} />
            </div>
            <div>
                <h2>Gestión de Horarios</h2>
                <p>Asignación directa de cursos registrados por nivel educativo.</p>
            </div>
        </div>
      </header>

      {/* Selector de Nivel (Tabs) */}
      <div className="mobile-tabs-container" style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '2px' }}>
        {['Inicial', 'Primaria', 'Secundaria'].map(lvl => (
            <button
                key={lvl}
                onClick={() => { setActiveTab(lvl as any); setSelectedTargetId(''); }}
                style={{
                    padding: '0.8rem 1.5rem',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    background: activeTab === lvl ? 'var(--color-primary-800)' : 'transparent',
                    color: activeTab === lvl ? '#fff' : '#64748b',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    whiteSpace: 'nowrap'
                }}
            >
                {lvl}
            </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Selector de Grado/Grupo */}
        <div className="panel-card" style={{ padding: '1rem' }}>
            <h4 style={{ marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <BookOpen size={16} /> Grado o Grupo Seleccionado
            </h4>
            <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {currentLevelTargets.map((target) => (
                    <button
                        key={target.id}
                        onClick={() => setSelectedTargetId(target.id)}
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '20px',
                            whiteSpace: 'nowrap',
                            fontSize: '0.85rem',
                            border: 'none',
                            background: target.id === activeTargetId ? 'var(--color-primary-800)' : '#f1f5f9',
                            color: target.id === activeTargetId ? '#fff' : '#475569',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {target.name}
                    </button>
                ))}
            </div>
        </div>

        {/* Editor de Horario */}
        <div className="panel-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="panel-card__header" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Edición: {activeTarget?.name || '---'}</h3>
                    {is6toPrimaria && (
                        <span style={{ fontSize: '0.7rem', color: '#134e4a', background: '#f0fdfa', padding: '0.2rem 0.6rem', border: '1px solid #5eead4', borderRadius: '15px', fontWeight: 'bold' }}>
                            Modo Pre-Secundaria Activo
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569' }}>
                        <UserCheck size={16} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Responsable / Tutor:</span>
                    </div>
                    <select 
                        value={tutorId}
                        onChange={(e) => void updateTutor(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: tutorId ? 'var(--color-primary-800)' : '#94a3b8', fontSize: '0.85rem', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="">-- Sin asignar --</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.fullName}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="table-wrapper" style={{ margin: 0 }}>
                <table style={{ minWidth: '700px' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '100px' }}>Bloque</th>
                            {DAYS.map(day => <th key={day}>{day}</th>)}
                        </tr>
                    </thead>
                    <tbody style={{ opacity: loadingSchedule ? 0.6 : 1 }}>
                        {hours.map((hour) => {
                            if (hour.type === 'break') {
                                return (
                                    <tr key={hour.time} style={{ background: '#f8fafc' }}>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{hour.label}</td>
                                        <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '2px', fontWeight: 'bold' }}>
                                            {hour.label.toUpperCase()}
                                        </td>
                                    </tr>
                                )
                            }
                            return (
                                <tr key={hour.index}>
                                    <td style={{ textAlign: 'center', background: '#f8fafc', padding: '0.5rem' }}>
                                        <strong style={{ fontSize: '0.8rem' }}>{hour.label}</strong><br/>
                                        <small style={{ color: '#64748b', fontSize: '0.7rem' }}>{hour.time}</small>
                                    </td>
                                    {DAYS.map((day) => {
                                        const cellKey = `${day}-${hour.index}`
                                        const cellValue = scheduleData[cellKey] || ''
                                        
                                        // Find course (allow Secundaria level if 6to Primaria)
                                        const matchedCourse = courses.find(c => 
                                            c.name === cellValue && 
                                            (c.level === activeTab || (is6toPrimaria && c.level === 'Secundaria'))
                                        )
                                        const bgColor = matchedCourse?.color || 'transparent'

                                        return (
                                            <td key={cellKey} style={{ padding: '2px', height: '55px' }}>
                                                <select 
                                                    value={cellValue}
                                                    onChange={(e) => void updateScheduleItem(day, hour.index, e.target.value)}
                                                    style={{ 
                                                        width: '100%', 
                                                        height: '100%', 
                                                        border: cellValue ? 'none' : '1px dashed #e2e8f0', 
                                                        textAlignLast: 'center',
                                                        background: cellValue ? bgColor : 'transparent',
                                                        color: cellValue ? '#000' : '#cbd5e1',
                                                        fontSize: '0.8rem',
                                                        fontWeight: cellValue ? '700' : '400',
                                                        outline: 'none',
                                                        cursor: 'pointer',
                                                        borderRadius: '4px'
                                                    }}
                                                >
                                                    <option value="">-- Vacío --</option>
                                                    <optgroup label={`CURSOS ${activeTab.toUpperCase()}`}>
                                                        {levelCatalogCourses.filter(c => c.level === activeTab).map(course => (
                                                            <option key={course.id} value={course.name}>
                                                                {course.name}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                    {is6toPrimaria && (
                                                        <optgroup label="CURSOS SECUNDARIA">
                                                            {levelCatalogCourses.filter(c => c.level === 'Secundaria').map(course => (
                                                                <option key={course.id} value={course.name}>
                                                                    {course.name}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                </select>
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Footer Info */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {is6toPrimaria ? (
                <>
                    <Info size={16} color="#0d9488" />
                    <span style={{ fontSize: '0.85rem', color: '#0f766e' }}>
                        <strong>Modo Puente Activado:</strong> 6to de Primaria puede acceder a los cursos de Secundaria para facilitar la transición académica.
                    </span>
                </>
            ) : (
                <>
                    <AlertCircle size={16} color="var(--color-primary-800)" />
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {activeTarget?.id === 'inicial-4-5-shared' 
                            ? 'AVISO: Cualquier cambio aquí afectará simultáneamente a los grados de 4 y 5 años.'
                            : `Estás visualizando todos los cursos registrados para el nivel ${activeTab}.`}
                    </span>
                </>
            )}
        </div>
      </div>
    </section>
  )
}
