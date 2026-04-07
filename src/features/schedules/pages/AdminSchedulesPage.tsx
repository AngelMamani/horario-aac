import { useState, useMemo } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useGrades } from '../../grades/hooks/useGrades'
import { useGradesConfig } from '../../grades/hooks/useGradesConfig'
import { useSchedule } from '../hooks/useSchedule'
import { useCourses } from '../../courses/hooks/useCourses'
import { useTeachers } from '../../teachers/hooks/useTeachers'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PanelCard } from '../../../shared/components/PanelCard'
import { ScheduleTable } from '../components/ScheduleTable'
import { Calendar, AlertCircle, Info } from 'lucide-react'

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

    grades.forEach(g => {
        if (g.level === 'Primaria') {
            map.Primaria.push({ id: g.id, name: g.name, level: 'Primaria' })
        }
    })

    const sortedGroups = [...secondaryGroupNumbers].sort((a, b) => a - b)
    sortedGroups.forEach(num => {
      map.Secundaria.push({ id: `Secundaria ${num}`, name: `Secundaria ${num}`, level: 'Secundaria' })
    })

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

  const handleExportPDF = async () => {
    const element = document.getElementById('schedule-to-print')
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.setFontSize(18)
    pdf.text(`Horario Escolar: ${activeTarget?.name || '---'}`, 15, 15)
    pdf.setFontSize(10)
    pdf.text(`Generado: ${new Date().toLocaleString()}`, 15, 22)
    
    pdf.addImage(imgData, 'PNG', 10, 30, pdfWidth - 20, pdfHeight)
    pdf.save(`Horario_${activeTarget?.name || 'Escolar'}.pdf`)
  }

  const hours = activeTab === 'Inicial' ? INICIAL_HOURS : PRIMARIA_SEC_HOURS

  if (loadingGrades || loadingConfig || loadingCourses || loadingTeachers) {
    return <section className="page-header"><h2>Cargando Editor...</h2></section>
  }

  return (
    <section>
      <PageHeader 
        title="Gestión de Horarios" 
        subtitle="Asignación directa de cursos registrados por nivel educativo."
        icon={Calendar}
      />

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
        
        <PanelCard title="Grado o Grupo Seleccionado" padding="1rem">
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
        </PanelCard>

        <ScheduleTable 
          days={DAYS}
          hours={hours}
          scheduleData={scheduleData}
          loadingSchedule={loadingSchedule}
          onUpdateItem={updateScheduleItem}
          tutorId={tutorId}
          onUpdateTutor={updateTutor}
          teachers={teachers}
          courses={courses}
          activeTab={activeTab}
          is6toPrimaria={is6toPrimaria}
          activeTargetName={activeTarget?.name || ''}
          onExportPDF={handleExportPDF}
        />

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '1.2rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            {is6toPrimaria ? (
                <>
                    <div style={{ background: '#f0fdf4', padding: '0.4rem', borderRadius: '8px' }}><Info size={20} color="#0d9488" /></div>
                    <span style={{ fontSize: '0.85rem', color: '#0f766e', lineHeight: '1.4' }}>
                        <strong>Modo Puente Activado:</strong> Al ser 6to de Primaria, tienes acceso a los cursos del catálogo de Secundaria para facilitar la transición académica de los estudiantes.
                    </span>
                </>
            ) : (
                <>
                    <div style={{ background: '#f8fafc', padding: '0.4rem', borderRadius: '8px' }}><AlertCircle size={20} color="var(--color-primary-800)" /></div>
                    <span style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.4' }}>
                        {activeTarget?.id === 'inicial-4-5-shared' 
                            ? 'AVISO: Cualquier cambio aquí afectará simultáneamente a los grados de 4 y 5 años debido a la configuración de malla compartida.'
                            : `Estás visualizando todos los cursos registrados para el nivel ${activeTab}. Selecciona una celda para asignar.`}
                    </span>
                </>
            )}
        </div>
      </div>
    </section>
  )
}
