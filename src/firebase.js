import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, onValue, remove, get, child } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyAKeXMJHfI930fyU6FWGhOAWeX4G1C_Dpk",
  authDomain: "asistencias-acar.firebaseapp.com",
  projectId: "asistencias-acar",
  storageBucket: "asistencias-acar.firebasestorage.app",
  messagingSenderId: "112464202535",
  appId: "1:112464202535:web:70dcb15953567a1eed7702",
  databaseURL: "https://asistencias-acar-default-rtdb.firebaseio.com"
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

export { db, ref, push, onValue, remove, get, child }