import type {
  Course,
  DashboardStat,
  Grade,
  Notice,
  QuickAction,
  ScheduleItem,
  Student,
  Teacher,
} from '../../../shared/types/admin.types'

export const adminStats: DashboardStat[] = [
  {
    id: 'students',
    title: 'Estudiantes matriculados',
    value: '1,248',
    detail: 'Actualizado al periodo 2026-I',
  },
  {
    id: 'teachers',
    title: 'Docentes activos',
    value: '78',
    detail: 'Incluye coordinadores de area',
  },
  {
    id: 'sections',
    title: 'Secciones habilitadas',
    value: '42',
    detail: 'Inicial, primaria y secundaria',
  },
  {
    id: 'attendance',
    title: 'Asistencia promedio',
    value: '94.6%',
    detail: 'Últimos 30 días',
  },
]

export const quickActions: QuickAction[] = [
  {
    id: 'new-student',
    label: 'Registrar estudiante',
    helperText: 'Alta rápida en secretaría académica',
  },
  {
    id: 'new-teacher',
    label: 'Agregar docente',
    helperText: 'Asignación a área y sección',
  },
  {
    id: 'new-schedule',
    label: 'Publicar horario',
    helperText: 'Generar horario por grado',
  },
  {
    id: 'attendance-report',
    label: 'Reporte de asistencia',
    helperText: 'Exportar resumen mensual en PDF',
  },
]

export const todaySchedule: ScheduleItem[] = [
  {
    id: 'schedule-01',
    grade: '1ro Secundaria A',
    shift: 'Mañana',
    tutor: 'Prof. Diana Huaman',
    classroom: 'Pabellón B - Aula 05',
  },
  {
    id: 'schedule-02',
    grade: '4to Primaria B',
    shift: 'Mañana',
    tutor: 'Prof. Luis Rojas',
    classroom: 'Pabellón A - Aula 12',
  },
  {
    id: 'schedule-03',
    grade: '5to Secundaria A',
    shift: 'Tarde',
    tutor: 'Prof. Carla Gonzales',
    classroom: 'Pabellón C - Aula 02',
  },
  {
    id: 'schedule-04',
    grade: '3ro Primaria C',
    shift: 'Tarde',
    tutor: 'Prof. Kevin Salazar',
    classroom: 'Pabellón A - Aula 08',
  },
]

export const notices: Notice[] = [
  {
    id: 'notice-01',
    title: 'Reunión general con padres',
    description: 'Coordinar asistencia de tutores y agenda institucional.',
    priority: 'Alta',
    dueDate: '22 marzo 2026',
  },
  {
    id: 'notice-02',
    title: 'Actualización de inventario TIC',
    description: 'Verificar equipos de laboratorio y proyectores por aula.',
    priority: 'Media',
    dueDate: '25 marzo 2026',
  },
  {
    id: 'notice-03',
    title: 'Publicación de cronograma bimestral',
    description: 'Subir documento oficial al portal administrativo.',
    priority: 'Baja',
    dueDate: '28 marzo 2026',
  },
]

export const courses: Course[] = [
  {
    id: 'course-01',
    name: 'COMUNICACIÓN',
    level: 'Primaria',
  },
  {
    id: 'course-02',
    name: 'MATEMÁTICA',
    level: 'Primaria',
  },
  {
    id: 'course-03',
    name: 'CIENCIA Y TECNOLOGÍA',
    level: 'Primaria',
  },
  {
    id: 'course-04',
    name: 'PERSONAL SOCIAL',
    level: 'Primaria',
  },
]

export const grades: Grade[] = [
  {
    id: 'grade-01',
    name: '1ro Primaria',
    level: 'Primaria',
    sectionCount: 1,
    status: 'Activo',
  },
  {
    id: 'grade-02',
    name: '3ro Primaria',
    level: 'Primaria',
    sectionCount: 1,
    status: 'Activo',
  },
  {
    id: 'grade-03',
    name: '1ro Secundaria',
    level: 'Secundaria',
    sectionCount: 1,
    status: 'Activo',
    secondaryGroup: 'Secundaria 1',
  },
  {
    id: 'grade-04',
    name: '5to Secundaria',
    level: 'Secundaria',
    sectionCount: 1,
    status: 'En revisión',
    secondaryGroup: 'Secundaria 2',
  },
]

export const students: Student[] = [
  { id: 'st-01', fullName: 'Andrea Poma', grade: '4to Primaria B', status: 'Regular' },
  { id: 'st-02', fullName: 'Mateo Quispe', grade: '1ro Secundaria A', status: 'Regular' },
  { id: 'st-03', fullName: 'Luciana Torres', grade: '5to Secundaria A', status: 'Beca' },
]

export const teachers: Teacher[] = [
  { id: 'tc-01', fullName: 'Diana Huaman', position: 'CIENCIAS' },
  { id: 'tc-02', fullName: 'Luis Rojas', position: 'COMUNICACIÓN' },
  { id: 'tc-03', fullName: 'Carla Gonzales', position: 'MATEMÁTICA' },
]
