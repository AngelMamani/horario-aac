import { useState, useEffect } from 'react'
import { collection, onSnapshot, doc, writeBatch, deleteDoc, deleteField } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseClient'
import type { Grade } from '../../../shared/types/admin.types'

export function useGrades() {
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!db) {
      setLoading(false)
      return
    }
    const gradesCol = collection(db!, 'grades')
    const unsubscribe = onSnapshot(gradesCol, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data() as Grade)
      setGrades(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const deleteGrade = async (id: string) => {
    if (!db) return
    await deleteDoc(doc(db!, 'grades', id))
  }

  const batchCreateGrades = async (newGrades: Grade[]) => {
    if (!db || newGrades.length === 0) return
    const batch = writeBatch(db!)
    newGrades.forEach((grade) => {
      const gradeRef = doc(db!, 'grades', grade.id)
      batch.set(gradeRef, grade)
    })
    await batch.commit()
  }

  const batchUpdateSecondaryGroups = async (
    updates: { id: string; secondaryGroup: string | undefined }[],
  ) => {
    if (!db || updates.length === 0) return
    const batch = writeBatch(db!)
    updates.forEach((update) => {
      const gradeRef = doc(db!, 'grades', update.id)
      batch.update(gradeRef, {
        secondaryGroup: update.secondaryGroup === undefined ? deleteField() : update.secondaryGroup,
      })
    })
    await batch.commit()
  }

  return { grades, loading, deleteGrade, batchCreateGrades, batchUpdateSecondaryGroups }
}
