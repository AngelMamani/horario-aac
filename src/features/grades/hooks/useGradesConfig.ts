import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../../../firebase/firebaseClient'

export function useGradesConfig() {
  const [secondaryGroupNumbers, setSecondaryGroupNumbers] = useState<number[]>([1, 2, 3])
  const [loadingConfig, setLoadingConfig] = useState(true)

  useEffect(() => {
    if (!db) {
      setLoadingConfig(false)
      return
    }
    const configRef = doc(db!, 'config', 'gradesSettings')
    const unsubscribe = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (Array.isArray(data.secondaryGroupNumbers)) {
          setSecondaryGroupNumbers(data.secondaryGroupNumbers)
        }
      }
      setLoadingConfig(false)
    })
    return () => unsubscribe()
  }, [])

  const updateSecondaryGroupNumbers = async (newNumbers: number[]) => {
    if (!db) return
    const sorted = [...newNumbers].sort((a, b) => a - b)
    const configRef = doc(db!, 'config', 'gradesSettings')
    await setDoc(configRef, { secondaryGroupNumbers: sorted }, { merge: true })
  }

  return { secondaryGroupNumbers, updateSecondaryGroupNumbers, loadingConfig }
}
