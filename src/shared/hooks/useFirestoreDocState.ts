import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SetStateAction } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db as firestoreDb, isFirebaseConfigured } from '../../firebase/firebaseClient'

function readLocalStorageState<T>(key: string, initialValue: T): T {
  const stored = localStorage.getItem(key)
  if (!stored) return initialValue

  try {
    return JSON.parse(stored) as T
  } catch {
    return initialValue
  }
}

export function useFirestoreDocState<T>(
  collection: string,
  docId: string,
  initialValue: T,
  options?: { localStorageKey?: string },
) {
  const localKey = useMemo(
    () => options?.localStorageKey ?? `${collection}/${docId}`,
    [collection, docId, options?.localStorageKey],
  )

  const [value, setValue] = useState<T>(() => readLocalStorageState(localKey, initialValue))

  useEffect(() => {
    // Mantener la UI respondiendo incluso si Firestore no está configurado.
    // Cuando Firestore exista, onSnapshot sincroniza y reemplaza el valor.
    try {
      localStorage.setItem(localKey, JSON.stringify(value))
    } catch {
      // no-op
    }
  }, [localKey, value])

  useEffect(() => {
    if (!isFirebaseConfigured || !firestoreDb) return

    const ref = doc(firestoreDb, collection, docId)
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (!snapshot.exists()) return
      const data = snapshot.data() as T
      setValue(data)
    })

    return () => unsubscribe()
  }, [collection, docId])

  const setPersistedValue = useCallback(
    (action: SetStateAction<T>) => {
      setValue((prev) => {
        const nextValue = typeof action === 'function' ? (action as (p: T) => T)(prev) : action

        try {
          localStorage.setItem(localKey, JSON.stringify(nextValue))
        } catch {
          // no-op
        }

        if (firestoreDb) {
          void setDoc(doc(firestoreDb, collection, docId), nextValue as unknown as Record<string, unknown>, {
            merge: true,
          }).catch((error) => {
            // Si falla la escritura, al menos guardamos en localStorage para no perder cambios.
            console.error('[Firestore] Error al guardar documento:', error)
          })
        }

        return nextValue
      })
    },
    [collection, docId, localKey],
  )

  return [value, setPersistedValue] as const
}

