import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseClient'
import type { Teacher } from '../../../shared/types/admin.types'

export function useTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) {
      setLoading(false)
      return
    }
    const teachersCol = collection(db!, 'teachers')
    const unsubscribe = onSnapshot(teachersCol, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as Teacher)
      setTeachers(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
    if (!db) return
    
    // Generar ID basado en el cargo (position) si existe, sino en el nombre
    const sourceForId = teacher.position || teacher.fullName
    const id = sourceForId
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const newTeacher: Teacher = { ...teacher, id }
    await setDoc(doc(db!, 'teachers', id), newTeacher)
  }

  const deleteTeacher = async (id: string) => {
    if (!db) return
    await deleteDoc(doc(db!, 'teachers', id))
  }

  const updateTeacher = async (id: string, updates: Partial<Omit<Teacher, 'id'>>) => {
    if (!db) return
    const teacherRef = doc(db!, 'teachers', id)
    await setDoc(teacherRef, updates, { merge: true })
  }

  return { teachers, loading, addTeacher, deleteTeacher, updateTeacher }
}
