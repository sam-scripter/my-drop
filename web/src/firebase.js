// firebase.js — Firebase configuration for the tracking page
//
// This initializes Firebase on the web (browser side).
// We only need Firestore here — to listen to the rider's
// live location in real time.

import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

// These values are safe to include in frontend code —
// they identify your Firebase project but don't grant any access.
// Access is controlled by Firestore security rules.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)