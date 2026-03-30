import { useStudents } from '../../students/hooks/useStudents'
import { useGrades } from '../../grades/hooks/useGrades'
import { useTeachers } from '../../teachers/hooks/useTeachers'
import { useCourses } from '../../courses/hooks/useCourses'

export function ReportsPage() {
  const { students, loading: loadingStudents } = useStudents()
  const { grades } = useGrades()
  const { teachers } = useTeachers()
  const { courses } = useCourses()

  // Calcular distribución por niveles REAL
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
    <section className="animate-in">
      <header className="page-header">
        <div className="header-badge">INDICADORES EN TIEMPO REAL</div>
        <h2>Reportes e Indicadores</h2>
        <p>Análisis institucional sincronizado con la base de datos central.</p>
      </header>

      {/* Grid de Reportes Principales Sincronizados */}
      <section className="stats-grid" style={{ marginBottom: '2rem' }}>
        {reportCategories.map((report, idx) => (
          <div key={idx} className="stat-card animate-pop-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="stat-card__icon-badge">📊</div>
            <div className="stat-card__content">
              <p className="stat-card__title">{report.title}</p>
              <p className="stat-card__value">{report.total}</p>
              <p className="stat-card__detail">{report.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="dashboard-structured-layout">
        <div className="dashboard-content-main">
          {/* Gráfico de Barras con Datos REALES de Firestore */}
          <div className="panel-card panel-section">
            <div className="panel-card__header">
              <h3>Distribución de Alumnos por Nivel</h3>
              <span>Censo escolar sincronizado ({totalStudents} alumnos totales)</span>
            </div>
            <div style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
              {['Inicial', 'Primaria', 'Secundaria'].map((level) => {
                const count = distribution[level] || 0
                const pct = getPercentage(count)
                return (
                  <div key={level} className="bar-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600 }}>Nivel {level}</span>
                      <span style={{ color: 'var(--color-primary-800)', fontWeight: 700 }}>{count} Alumnos ({pct.toFixed(1)}%)</span>
                    </div>
                    <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${pct}%`, 
                          height: '100%', 
                          background: level === 'Inicial' ? 'linear-gradient(90deg, #13639f, #4ade80)' : 
                                      level === 'Primaria' ? 'linear-gradient(90deg, #0e4a7f, #13639f)' : 
                                      'linear-gradient(90deg, #08365f, #0e4a7f)',
                          transition: 'width 1s ease-in-out'
                        }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="panel-card">
             <div className="panel-card__header">
                <h3>Recursos para Descarga</h3>
                <span>Generación de documentos institucionales</span>
             </div>
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
          </div>
        </div>

        <aside className="dashboard-content-aside">
           <div className="panel-card">
              <div className="panel-card__header">
                 <h3>Filtros de Análisis</h3>
              </div>
              <div style={{ padding: '0 1rem 1.5rem' }}>
                 <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                    Los datos se actualizan automáticamente desde Firebase.
                 </p>
                 <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Periodo Lectivo</label>
                    <select style={{ width: '100%', marginTop: '0.4rem', padding: '0.5rem', border: '1px solid #c8dce9', borderRadius: '6px' }}>
                       <option>Año 2026</option>
                    </select>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </section>
  )
}
