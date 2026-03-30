import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminDashboardPage } from './features/dashboard/pages/AdminDashboardPage'
import { AdminLayout } from './app/layout/AdminLayout'
import { StudentsPage } from './features/students/pages/StudentsPage'
import { TeachersPage } from './features/teachers/pages/TeachersPage'
import { SchedulesPage } from './features/schedules/pages/SchedulesPage'
import { CoursesPage } from './features/courses/pages/CoursesPage'
import { GradesPage } from './features/grades/pages/GradesPage'
import { ReportsPage } from './features/reports/pages/ReportsPage'
import { SettingsPage } from './features/settings/pages/SettingsPage'
import { MallaCurricularPage } from './features/malla/pages/MallaCurricularPage'
import { TeacherAssignmentsPage } from './features/teachers/pages/TeacherAssignmentsPage'
import { AdminSchedulesPage } from './features/schedules/pages/AdminSchedulesPage'

function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<AdminDashboardPage />} />
        <Route path="/estudiantes" element={<StudentsPage />} />
        <Route path="/docentes" element={<TeachersPage />} />
        <Route path="/horarios" element={<SchedulesPage />} />
        <Route path="/gestion-horarios" element={<AdminSchedulesPage />} />
        <Route path="/cursos" element={<CoursesPage />} />
        <Route path="/grados" element={<GradesPage />} />
        <Route path="/malla-curricular" element={<MallaCurricularPage />} />
        <Route path="/asignacion-docentes" element={<TeacherAssignmentsPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/configuracion" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
