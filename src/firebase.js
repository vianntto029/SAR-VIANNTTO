import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAKeXMJHfI930fyU6FWGhOAWeX4G1C_Dpk",
  authDomain: "asistencias-acar.firebaseapp.com",
  projectId: "asistencias-acar",
  storageBucket: "asistencias-acar.firebasestorage.app",
  messagingSenderId: "112464202535",
  appId: "1:112464202535:web:70dcb15953567a1eed7702"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export { db, collection, addDoc, getDocs, query, where, deleteDoc, doc }