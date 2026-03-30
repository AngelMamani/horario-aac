import { Link } from 'react-router-dom'
import { CourseTable } from '../components/CourseTable'
import { NoticeList } from '../components/NoticeList'
import { StatCard } from '../components/StatCard'
import { quickActions } from '../data/admin-data'
import { useDashboardData } from '../hooks/useDashboardData'

export function AdminDashboardPage() {
  const { stats, courses, notices, loading } = useDashboardData()

  const actionIconMap: Record<string, string> = {
    'new-student': '👤+',
    'new-teacher': '👨‍🏫+',
    'new-schedule': '📅',
    'attendance-report': '📊'
  }

  const actionRouteMap: Record<string, string> = {
    'new-student': '/estudiantes',
    'new-teacher': '/docentes',
    'new-schedule': '/horarios',
    'attendance-report': '/reportes',
  }

  if (loading) {
     return (
        <div className="dashboard-loading">
           <div className="loader"></div>
           <p>Sincronizando con la red académica...</p>
        </div>
     )
  }

  return (
    <section className="dashboard-page animate-in">
      {/* Nuevo Header mas Profesional y Limpio */}
      <header className="dashboard-hero animate-slide-down">
        <div className="dashboard-hero__content">
          <div className="dashboard-hero__welcome">
            <span className="live-status-pill">
              <span className="live-status-dot"></span>
              Sistema Operativo
            </span>
            <h1>¡Bienvenido al Panel de Control!</h1>
            <p>I.E.P. Andrés Avelino Cáceres • Gestión 2026</p>
          </div>
          <div className="dashboard-hero__date">
             <span className="date-display">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </header>

      {/* Grid de Estadisticas mas Visuales */}
      <section className="stats-grid stats-grid--premium" aria-label="Resumen ejecutivo">
        {stats.map((stat, idx) => (
          <div key={stat.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.08}s` }}>
            <StatCard stat={stat} />
          </div>
        ))}
      </section>

      <div className="dashboard-structured-layout">
        {/* Contenido Principal Izquierda */}
        <div className="dashboard-content-main">
          <section className="panel-section">
            <div className="panel-section__header">
              <h3>Accesos Directos</h3>
              <p>Acciones rápidas para la gestión diaria</p>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map((action, idx) => (
                <Link
                  key={action.id}
                  className="quick-action-card animate-pop-in"
                  style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                  to={actionRouteMap[action.id] ?? '/'}
                >
                  <div className="quick-action-card__icon">
                     {actionIconMap[action.id]}
                  </div>
                  <div className="quick-action-card__info">
                     <h4>{action.label}</h4>
                     <p>{action.helperText}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel-section animate-fade-in" style={{ animationDelay: '0.7s' }}>
             <CourseTable courses={courses} />
          </section>
        </div>

        {/* Columna Derecha de Avisos y Actividad */}
        <aside className="dashboard-content-aside animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
           <NoticeList notices={notices} />
           
           <div className="panel-card activity-card">
              <div className="panel-card__header">
                <h3>Estado del Sistema</h3>
              </div>
              <div className="activity-list">
                 <div className="activity-item">
                    <span className="activity-dot success"></span>
                    <div>
                       <p>Base de datos Firebase</p>
                       <small>Conectado y Sincronizado</small>
                    </div>
                 </div>
                 <div className="activity-item">
                    <span className="activity-dot warning"></span>
                    <div>
                       <p>Copia de seguridad</p>
                       <small>Programada para las 11:00 PM</small>
                    </div>
                 </div>
              </div>
           </div>
        </aside>
      </div>
    </section>
  )
}
