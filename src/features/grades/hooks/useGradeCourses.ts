import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../../../firebase/firebaseClient'
import type { GradeCourse } from '../../../shared/types/admin.types'

export function useGradeCourses(gradeId: string | null) {
  const [gradeCourses, setGradeCourses] = useState<GradeCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db || !gradeId) {
      setGradeCourses([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    const gradeCoursesRef = collection(db, 'gradeCourses')
    const q = query(gradeCoursesRef, where('gradeId', '==', gradeId))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as GradeCourse)
      setGradeCourses(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [gradeId])

  const assignCourseToGrade = async (gradeId: string, courseId: string, teacherId: string) => {
    if (!db) return
    const id = `${gradeId}_${courseId}`
    const gradeCourseRef = doc(db, 'gradeCourses', id)
    await setDoc(gradeCourseRef, {
      id,
      gradeId,
      courseId,
      teacherId,
    })
  }

  const removeCourseFromGrade = async (id: string) => {
    if (!db) return
    await deleteDoc(doc(db, 'gradeCourses', id))
  }

  return { gradeCourses, loading, assignCourseToGrade, removeCourseFromGrade }
}
