import { useStudents } from '../../students/hooks/useStudents'
import { useGrades } from '../../grades/hooks/useGrades'
import { useTeachers } from '../../teachers/hooks/useTeachers'
import { useCourses } from '../../courses/hooks/useCourses'
import { PageHeader } from '../../../shared/components/PageHeader'
import { PanelCard } from '../../../shared/components/PanelCard'
import { StatCards } from '../components/StatCards'
import { DistributionChart } from '../components/DistributionChart'
import { BarChart3 } from 'lucide-react'

export function ReportsPage() {
  const { students } = useStudents()
  const { grades } = useGrades()
  const { teachers } = useTeachers()
  const { courses } = useCourses()

  const distribution = students.reduce((acc, student) => {
    const grade = grades.find(g => g.name === student.grade)
    const level = grade ? grade.level : 'Otros'
    acc[level] = (acc[level] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalStudents = students.length
  const getPercentage = (count: number) => totalStudents > 0 ? (count / totalStudents) * 100 : 0

  const reportCategories = [
    { 
      title: 'Matrícula Real-Time', 
      total: totalStudents.toString(), 
      detail: `${distribution['Inicial'] || 0} Inicial • ${distribution['Primaria'] || 0} Primaria • ${distribution['Secundaria'] || 0} Secundaria` 
    },
    { 
      title: 'Personal Docente', 
      total: teachers.length.toString(), 
      detail: 'Docentes registrados en plataforma' 
    },
    { 
      title: 'Malla Curricular', 
      total: courses.length.toString(), 
      detail: 'Cursos activos en el sistema' 
    },
    { 
      title: 'Asistencia Hoy', 
      total: '94.6%', 
      detail: 'Basado en registro diario (Demo)' 
    },
  ]

  return (
    <section>
      <PageHeader 
        title="Reportes e Indicadores" 
        subtitle="Análisis institucional sincronizado con la base de datos central."
        icon={BarChart3}
      />

      <StatCards categories={reportCategories} />

      <div className="dashboard-structured-layout">
        <div className="dashboard-content-main" style={{ display: 'grid', gap: '1.5rem' }}>
          <PanelCard 
            title="Distribución de Alumnos por Nivel" 
            headerActions={<span>Censo escolar sincronizado ({totalStudents} alumnos totales)</span>}
            padding="0"
          >
            <DistributionChart 
              distribution={distribution}
              getPercentage={getPercentage}
            />
          </PanelCard>

          <PanelCard 
            title="Recursos para Descarga" 
            headerActions={<span>Generación de documentos institucionales</span>}
            padding="0"
          >
            <div className="table-wrapper">
                <table style={{ borderTop: 'none' }}>
                   <thead>
                      <tr>
                         <th>Documento</th>
                         <th>Formato</th>
                         <th>Última Actualización</th>
                         <th style={{ textAlign: 'center' }}>Acción</th>
                      </tr>
                   </thead>
                   <tbody>
                      <tr>
                         <td>Nóminas de Matrícula (SIAGIE)</td>
                         <td><span className="badge badge--medium">PDF / Excel</span></td>
                         <td>{new Date().toLocaleDateString()}</td>
                         <td style={{ textAlign: 'center' }}>
                            <button className="btn btn--small btn--primary">Generar</button>
                         </td>
                      </tr>
                      <tr>
                         <td>Reporte de Asistencia Institucional</td>
                         <td><span className="badge badge--medium">Excel</span></td>
                         <td>Sincronizado</td>
                         <td style={{ textAlign: 'center' }}>
                            <button className="btn btn--small btn--primary">Descargar</button>
                         </td>
                      </tr>
                   </tbody>
                </table>
             </div>
          </PanelCard>
        </div>

        <aside className="dashboard-content-aside">
          <PanelCard title="Filtros de Análisis">
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Los datos se actualizan automáticamente desde Firebase.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Periodo Lectivo</label>
              <select style={{ width: '100%', marginTop: '0.4rem', padding: '0.8rem', border: '1px solid #c8dce9', borderRadius: '12px', fontSize: '1rem' }}>
                <option>Año 2026</option>
              </select>
            </div>
          </PanelCard>
        </aside>
      </div>
    </section>
  )
}
