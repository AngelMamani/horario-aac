import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseClient'

export function useSchedule(gradeId: string | null) {
  const [scheduleData, setScheduleData] = useState<Record<string, string>>({})
  const [tutorId, setTutorId] = useState<string>('')
  const [loadingSchedule, setLoadingSchedule] = useState(false)

  useEffect(() => {
    if (!db || !gradeId) {
      setScheduleData({})
      setTutorId('')
      return
    }
    setLoadingSchedule(true)
    setScheduleData({}) // LIMPIAR datos anteriores para evitar contaminación
    const scheduleRef = doc(db, 'schedules', gradeId)
    const unsubscribe = onSnapshot(scheduleRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data()
        setScheduleData(data.activities || {})
        setTutorId(data.tutorId || '')
      } else {
        setScheduleData({})
        setTutorId('')
      }
      setLoadingSchedule(false)
    })
    return () => unsubscribe()
  }, [gradeId])

  const updateScheduleItem = async (day: string, hourIndex: string | number, text: string) => {
    if (!db || !gradeId) return
    const key = `${day}-${hourIndex}`
    const updated = { ...scheduleData, [key]: text }
    
    // Optimistic update para que no haya delay visual en el input
    setScheduleData(updated)
    
    const scheduleRef = doc(db, 'schedules', gradeId)
    await setDoc(scheduleRef, { activities: updated }, { merge: true })
  }

  const updateTutor = async (newTutorId: string) => {
    if (!db || !gradeId) return
    setTutorId(newTutorId)
    const scheduleRef = doc(db, 'schedules', gradeId)
    await setDoc(scheduleRef, { tutorId: newTutorId }, { merge: true })
  }

  return { scheduleData, tutorId, loadingSchedule, updateScheduleItem, updateTutor }
}
