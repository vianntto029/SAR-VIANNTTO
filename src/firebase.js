import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, onValue, remove, get } from 'firebase/database'

// =====================================================
// IMPORTANTE: Reemplaza estos valores con los de TU
// proyecto de Firebase para ACAR
// =====================================================
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto-acar.firebaseapp.com",
  databaseURL: "https://tu-proyecto-acar-default-rtdb.firebaseio.com",
  projectId: "tu-proyecto-acar",
  storageBucket: "tu-proyecto-acar.firebasestorage.app",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export { db, ref, push, onValue, remove, get }