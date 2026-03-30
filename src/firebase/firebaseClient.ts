import { getApps, initializeApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined
const appId = import.meta.env.VITE_FIREBASE_APP_ID as string | undefined

export const isFirebaseConfigured = Boolean(
  apiKey && authDomain && projectId && storageBucket && messagingSenderId && appId,
)

let db: Firestore | null = null

if (isFirebaseConfigured) {
  const config = {
    apiKey: apiKey!,
    authDomain: authDomain!,
    projectId: projectId!,
    storageBucket: storageBucket!,
    messagingSenderId: messagingSenderId!,
    appId: appId!,
  }

  const app = getApps().length ? getApps()[0] : initializeApp(config)
  db = getFirestore(app)
}

export { db }

