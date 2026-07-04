import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app'
import { Firestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { FirebaseStorage, getStorage } from 'firebase/storage'
import { environment } from '../../../environments/environment'

/** Single source of truth for the default Firebase app: everywhere that used to import its own
 * copy of firebaseConfig and call initializeApp()/AngularFireModule.initializeApp() (which could
 * each run before the other) now goes through here instead, so there's exactly one app and one
 * Firestore instance app-wide. initializeApp() itself is safe to call more than once for the
 * same config (it deep-equal-checks and returns the existing app), but Firestore/Auth's own
 * initializeX() calls are not, so those still need a real singleton getter like the ones below. */
export function getFirebaseApp(): FirebaseApp {
  const firebaseConfig = (environment as any).firebaseConfig
  return getApps().length ? getApp() : initializeApp(firebaseConfig)
}

let firestoreInstance: Firestore | undefined

export function getAppFirestore(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = initializeFirestore(getFirebaseApp(), {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  }
  return firestoreInstance
}

let storageInstance: FirebaseStorage | undefined

export function getAppStorage(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = getStorage(getFirebaseApp())
  }
  return storageInstance
}
