import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseClient'
import type { Course } from '../../../shared/types/admin.types'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) {
      setLoading(false)
      return
    }
    const coursesCol = collection(db!, 'courses')
    const unsubscribe = onSnapshot(coursesCol, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as Course)
      setCourses(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const addCourse = async (course: Omit<Course, 'id'>) => {
    if (!db) return
    const baseId = course.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const id = `${baseId}-${course.level.toLowerCase()}`

    const newCourse: Course = { ...course, id }
    await setDoc(doc(db!, 'courses', id), newCourse)
  }

  const deleteCourse = async (id: string) => {
    if (!db) return
    await deleteDoc(doc(db!, 'courses', id))
  }

  const updateCourse = async (id: string, data: Partial<Omit<Course, 'id'>>) => {
    if (!db) return
    const courseRef = doc(db!, 'courses', id)
    await setDoc(courseRef, data, { merge: true })
  }

  return { courses, loading, addCourse, deleteCourse, updateCourse }
}
