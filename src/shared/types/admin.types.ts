export type QuickAction = {
  id: string
  label: string
  helperText: string
}

export type DashboardStat = {
  id: string
  title: string
  value: string
  detail: string
}

export type ScheduleItem = {
  id: string
  grade: string
  shift: 'Mañana' | 'Tarde'
  tutor: string
  classroom: string
}

export type Notice = {
  id: string
  title: string
  description: string
  priority: 'Alta' | 'Media' | 'Baja'
  dueDate: string
}

export type Course = {
  id: string
  name: string
  level: 'Inicial' | 'Primaria' | 'Secundaria'
  color?: string
}

export type Grade = {
  id: string
  name: string
  level: 'Inicial' | 'Primaria' | 'Secundaria'
  sectionCount: number
  status: 'Activo' | 'En revisión'
  secondaryGroup?: string
}

export type GradeCourse = {
  id: string
  gradeId: string
  courseId: string
  teacherId: string
}

export type Student = {
  id: string
  fullName: string
  grade: string
  status: string
}

export type Teacher = {
  id: string
  fullName: string
  position?: string
}

