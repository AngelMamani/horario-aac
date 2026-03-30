import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseClient'
import type { Course, Grade, Notice, DashboardStat } from '../../../shared/types/admin.types'

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStat[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) {
      setLoading(false)
      return
    }

    // 1. Monitor SECTIONS from GRADES
    const gradesUnsub = onSnapshot(collection(db, 'grades'), (snapshot) => {
      const gradesData = snapshot.docs.map(doc => doc.data() as Grade)
      const sectionCount = gradesData.reduce((acc, g) => acc + (g.sectionCount || 1), 0)
      
      setStats(prev => {
        const otherStats = prev.filter(s => s.id !== 'sections')
        return [
          ...otherStats,
          { 
            id: 'sections', 
            title: 'Secciones habilitadas', 
            value: sectionCount.toString(), 
            detail: 'Inicial, Primaria y Secundaria' 
          }
        ].sort((a, b) => a.id.localeCompare(b.id))
      })
    })

    // 2. Monitor TEACHERS count
    const teachersUnsub = onSnapshot(collection(db, 'teachers'), (snapshot) => {
      const count = snapshot.size
      setStats(prev => {
        const otherStats = prev.filter(s => s.id !== 'teachers')
        return [
          ...otherStats,
          { 
            id: 'teachers', 
            title: 'Docentes registrados', 
            value: count.toString(), 
            detail: 'Equipo académico activo' 
          }
        ].sort((a, b) => a.id.localeCompare(b.id))
      })
    })

    // 3. Monitor COURSES (real-time list)
    const coursesUnsub = onSnapshot(collection(db, 'courses'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Course))
      // Solo mostramos los últimos 5 para el dashboard
      setCourses(data.slice(-5))
      
      // Update courses count stat
      setStats(prev => {
        const otherStats = prev.filter(s => s.id !== 'courses')
        return [
          ...otherStats,
          { 
            id: 'courses', 
            title: 'Cursos activos', 
            value: data.length.toString(), 
            detail: 'Malla curricular oficial' 
          }
        ].sort((a, b) => a.id.localeCompare(b.id))
      })
    })

    // 4. Monitor STUDENTS count
    const studentsUnsub = onSnapshot(collection(db, 'students'), (snapshot) => {
      const count = snapshot.size
      setStats(prev => {
        const otherStats = prev.filter(s => s.id !== 'students')
        return [
          ...otherStats,
          { 
            id: 'students', 
            title: 'Estudiantes totales', 
            value: count.toString(), 
            detail: 'Altas en el sistema' 
          }
        ].sort((a, b) => a.id.localeCompare(b.id))
      })
    })

    // 5. Monitor NOTICES
    const noticesUnsub = onSnapshot(collection(db, 'notices'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notice))
      setNotices(data)
    })

    // Initial Static Placeholder for Attendance (until it's real)
    setStats(prev => {
      if (prev.some(s => s.id === 'attendance')) return prev
      return [
        ...prev,
        { id: 'attendance', title: 'Asistencia promedio', value: '94.6%', detail: 'Periodo lectivo actual' }
      ]
    })

    setLoading(false)

    return () => {
      gradesUnsub()
      teachersUnsub()
      coursesUnsub()
      studentsUnsub()
      noticesUnsub()
    }
  }, [])

  return { stats, courses, notices, loading }
}
