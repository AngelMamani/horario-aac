import { useState, useMemo } from 'react'
import { useGrades } from '../../grades/hooks/useGrades'
import { useGradesConfig } from '../../grades/hooks/useGradesConfig'
import { useSchedule } from '../hooks/useSchedule'
import { useCourses } from '../../courses/hooks/useCourses'
import { useTeachers } from '../../teachers/hooks/useTeachers'
import { User } from 'lucide-react'

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

export function SchedulesPage() {
  const { grades, loading: loadingGrades } = useGrades()
  const { secondaryGroupNumbers, loadingConfig } = useGradesConfig()
  const { courses } = useCourses()
  const { teachers } = useTeachers()
  
  const scheduleTargets = useMemo(() => {
    const targets: { id: string; name: string; level: string }[] = []
    
    // Group Inicial 4 and 5
    const inicialGrades = grades.filter(g => g.level === 'Inicial')
    const carries4or5 = inicialGrades.some(g => g.name === '4 años' || g.name === '5 años')
    
    if (carries4or5) {
        targets.push({ id: 'inicial-4-5-shared', name: 'Inicial (4 y 5 años)', level: 'Inicial' })
    }

    inicialGrades.forEach(g => {
        if (g.name !== '4 años' && g.name !== '5 años') {
            targets.push({ id: g.id, name: g.name, level: 'Inicial' })
        }
    })

    // Primaria
    grades.forEach(g => {
        if (g.level === 'Primaria') {
            targets.push({ id: g.id, name: g.name, level: g.level })
        }
    })

    // Secundaria Groups only
    const sortedGroups = [...secondaryGroupNumbers].sort((a, b) => a - b)
    sortedGroups.forEach(num => {
      targets.push({ id: `Secundaria ${num}`, name: `Grupo Secundaria ${num}`, level: 'Secundaria' })
    })

    return targets
  }, [grades, secondaryGroupNumbers])

  const [selectedTargetId, setSelectedTargetId] = useState<string>('')
  
  const activeTargetId = selectedTargetId || (scheduleTargets.length > 0 ? scheduleTargets[0].id : '')
  const activeTarget = scheduleTargets.find(t => t.id === activeTargetId)
  const activeLevel = activeTarget?.level || 'Primaria'
  const normalizedTargetName = activeTarget?.name.toLowerCase() || ''
  const is6toPrimaria = normalizedTargetName.includes('6to') && normalizedTargetName.includes('primaria')

  const { scheduleData, tutorId, loadingSchedule } = useSchedule(activeTargetId)
  
  const matchedTutor = teachers.find(t => t.id === tutorId)

  const hours = activeLevel === 'Inicial' ? INICIAL_HOURS : PRIMARIA_SEC_HOURS

  if (loadingGrades || loadingConfig) {
    return <section className="page-header"><h2>Cargando Horarios...</h2></section>
  }

  return (
    <section>
      <header className="page-header">
        <h2>Horario Institucional</h2>
        <p>Vista de programación semanal con identificación de colores por asignatura.</p>
      </header>

      <div className="panel-card" style={{ padding: '0.8rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap' }}>
          {scheduleTargets.map((target) => (
            <button
              key={target.id}
              onClick={() => setSelectedTargetId(target.id)}
              style={{
                borderRadius: '20px',
                padding: '0.4rem 1.25rem',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
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

      <div className="panel-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="panel-card__header" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
               <div>
                  <h3 style={{ margin: 0, color: 'var(--color-primary-900)' }}>{activeTarget?.name || '---'}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Nivel: {activeLevel} {is6toPrimaria && '(Pre-Secundaria)'}</span>
               </div>
               
               {matchedTutor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.4rem 0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <User size={14} color="var(--color-primary-800)" />
                     <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                           {is6toPrimaria || activeLevel === 'Secundaria' ? 'Tutor del Grado' : 'Responsable'}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                           {matchedTutor.fullName}
                        </span>
                     </div>
                  </div>
               )}
            </div>
           {activeTarget?.id === 'inicial-4-5-shared' && (
              <span style={{ fontSize: '0.75rem', color: '#11845f', background: '#ecfdf5', padding: '0.3rem 0.8rem', borderRadius: '15px', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>
                 Horario Unificado
              </span>
           )}
        </div>

        <div className="table-wrapper" style={{ margin: 0 }}>
             <table style={{ minWidth: '700px' }}>
                <thead>
                   <tr>
                      <th style={{ width: '120px', textAlign: 'center' }}>Bloque</th>
                      {DAYS.map(day => <th key={day} style={{ textAlign: 'center' }}>{day}</th>)}
                   </tr>
                </thead>
                <tbody style={{ opacity: loadingSchedule ? 0.6 : 1 }}>
                   {hours.map((hour) => {
                      if (hour.type === 'break') {
                         return (
                            <tr key={hour.time} style={{ backgroundColor: '#f9f9f9' }}>
                               <td style={{ textAlign: 'center' }}><strong>{hour.label.toUpperCase()}</strong></td>
                               <td colSpan={5} style={{ textAlign: 'center', background: '#f5f5f5', color: '#888', fontStyle: 'italic', fontSize: '0.75rem' }}>Pausa Escolar</td>
                            </tr>
                         )
                      }
                      
                      return (
                         <tr key={hour.index}>
                            <td style={{ textAlign: 'center', background: '#fcfcfc' }}>
                               <strong>{hour.label}</strong><br/>
                               <small>{hour.time}</small>
                            </td>
                            {DAYS.map((day) => {
                               const cellKey = `${day}-${hour.index}`
                               const cellValue = scheduleData[cellKey] || ''
                               
                               // Find course (allow Secundaria level if 6to Primaria)
                               const matchedCourse = courses.find(c => 
                                 c.name === cellValue && 
                                 (c.level === activeLevel || (is6toPrimaria && c.level === 'Secundaria'))
                               )
                               const bgColor = matchedCourse?.color || 'transparent'

                               return (
                                  <td key={cellKey} style={{ textAlign: 'center', height: '60px', verticalAlign: 'middle', background: bgColor, border: bgColor !== 'transparent' ? '1px solid rgba(0,0,0,0.05)' : '1px solid #f1f5f9' }}>
                                     {cellValue ? (
                                        <div style={{ fontWeight: '800', color: '#000', fontSize: '0.85rem' }}>
                                           {cellValue}
                                        </div>
                                     ) : (
                                        <span style={{ color: '#eee' }}>---</span>
                                     )}
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
    </section>
  )
}
