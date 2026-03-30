import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseClient'
import type { Student } from '../../../shared/types/admin.types'

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) {
      setLoading(false)
      return
    }
    const studentsCol = collection(db!, 'students')
    const unsubscribe = onSnapshot(studentsCol, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as Student)
      setStudents(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const addStudent = async (student: Omit<Student, 'id'>) => {
    if (!db) return
    const id = student.fullName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const newStudent: Student = { ...student, id }
    await setDoc(doc(db!, 'students', id), newStudent)
  }

  const deleteStudent = async (id: string) => {
    if (!db) return
    await deleteDoc(doc(db!, 'students', id))
  }

  const updateStudent = async (id: string, updates: Partial<Omit<Student, 'id'>>) => {
    if (!db) return
    const studentRef = doc(db!, 'students', id)
    await setDoc(studentRef, updates, { merge: true })
  }

  return { students, loading, addStudent, deleteStudent, updateStudent }
}
