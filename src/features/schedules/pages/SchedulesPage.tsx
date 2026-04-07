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
import { Calendar, AlertCircle } from 'lucide-react'

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

    grades.forEach(g => {
        if (g.level === 'Primaria') {
            targets.push({ id: g.id, name: g.name, level: g.level })
        }
    })

    const sortedGroups = [...secondaryGroupNumbers].sort((a, b) => a - b)
    sortedGroups.forEach(num => {
      targets.push({ id: `Secundaria ${num}`, name: `Secundaria ${num}`, level: 'Secundaria' })
    })

    return targets.sort((a,b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  }, [grades, secondaryGroupNumbers])

  const [selectedTargetId, setSelectedTargetId] = useState<string>('')
  
  const activeTargetId = selectedTargetId || (scheduleTargets.length > 0 ? scheduleTargets[0].id : '')
  const activeTarget = scheduleTargets.find(t => t.id === activeTargetId)
  const activeLevel = activeTarget?.level || 'Primaria'
  const normalizedTargetName = activeTarget?.name.toLowerCase() || ''
  const is6toPrimaria = normalizedTargetName.includes('6to') && normalizedTargetName.includes('primaria')

  const { scheduleData, tutorId, loadingSchedule } = useSchedule(activeTargetId)
  
  const hours = activeLevel === 'Inicial' ? INICIAL_HOURS : PRIMARIA_SEC_HOURS

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
    pdf.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 22)
    
    pdf.addImage(imgData, 'PNG', 10, 30, pdfWidth - 20, pdfHeight)
    pdf.save(`Horario_${activeTarget?.name}.pdf`)
  }

  if (loadingGrades || loadingConfig) {
    return <section className="page-header"><h2>Cargando Horarios...</h2></section>
  }

  return (
    <section>
      <PageHeader 
        title="Horario Institucional" 
        subtitle="Vista de programación semanal con colores por asignatura."
        icon={Calendar}
      />

      <PanelCard padding="1rem">
        <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {scheduleTargets.map((target) => (
            <button
              key={target.id}
              onClick={() => setSelectedTargetId(target.id)}
              style={{
                borderRadius: '20px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.85rem',
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
      </PanelCard>

      <div style={{ height: '1.5rem' }} />

      <ScheduleTable 
        days={DAYS}
        hours={hours}
        scheduleData={scheduleData}
        loadingSchedule={loadingSchedule}
        onUpdateItem={async () => {}}
        tutorId={tutorId}
        onUpdateTutor={async () => {}}
        teachers={teachers}
        courses={courses}
        activeTab={activeLevel}
        is6toPrimaria={is6toPrimaria}
        activeTargetName={activeTarget?.name || ''}
        onExportPDF={handleExportPDF}
        isReadOnly={true}
      />

      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', padding: '1rem', marginTop: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <AlertCircle size={18} color="var(--color-primary-800)" />
        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Los colores de las celdas se asignan automáticamente según el catálogo de cursos institucional.
        </span>
      </div>
    </section>
  )
}
