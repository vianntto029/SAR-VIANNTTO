import { createContext, useContext, useEffect, useState } from 'react'
import { db, collection, addDoc, getDocs, query, where, deleteDoc, doc, onSnapshot, orderBy } from '../firebase'

const AttendanceContext = createContext(null)

export const INSTITUTOS = [
  { id: 'ACAR', nombre: 'Programa ACAR Sabatino' },
]

export function todayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function currentTime() {
  return new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

export function dailyCode(date) {
  return `ACAR-${date}`
}

export function useAttendance() {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider')
  return ctx
}

export function AttendanceProvider({ children }) {
  const [institutoActivo, setInstitutoActivo] = useState(() => {
    return localStorage.getItem('instituto-activo') || INSTITUTOS[0].id
  })
  const [materias, setMaterias] = useState([])
  const [attendance, setAttendance] = useState([])

  useEffect(() => {
    localStorage.setItem('instituto-activo', institutoActivo)
  }, [institutoActivo])

  useEffect(() => {
    const q = query(collection(db, 'institutos', institutoActivo, 'materias'), orderBy('nombre'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      setMaterias(data)
    })
    return () => unsub()
  }, [institutoActivo])

  useEffect(() => {
    const q = query(
      collection(db, 'institutos', institutoActivo, 'attendance'),
      orderBy('time', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id }))
      setAttendance(data)
    })
    return () => unsub()
  }, [institutoActivo])

  async function addMateria(nombre) {
    const clean = nombre.trim()
    if (!clean) return
    const exists = materias.find(m => m.nombre.toLowerCase() === clean.toLowerCase())
    if (exists) return
    await addDoc(collection(db, 'institutos', institutoActivo, 'materias'), { nombre: clean })
  }

  async function deleteMateria(id) {
    await deleteDoc(doc(db, 'institutos', institutoActivo, 'materias', id))
  }

  async function checkDuplicate(nationalId, date) {
    const q = query(
      collection(db, 'institutos', institutoActivo, 'attendance'),
      where('nationalId', '==', nationalId),
      where('date', '==', date)
    )
    const snap = await getDocs(q)
    return !snap.empty
  }

  async function registerAttendance({ name, subject, nationalId, seccion, representante, instituto }) {
    const target = instituto || institutoActivo
    const date = todayKey()
    const code = dailyCode(date)

    const duplicate = await checkDuplicate(nationalId, date)
    if (duplicate) {
      throw new Error('DUPLICADO')
    }

    const record = {
      name,
      subject,
      nationalId,
      seccion,
      representante: representante || '',
      date,
      time: currentTime(),
      code,
      instituto: target,
    }
    await addDoc(collection(db, 'institutos', target, 'attendance'), record)
    return record
  }

  async function resetAttendance(date) {
    const q = query(
      collection(db, 'institutos', institutoActivo, 'attendance'),
      where('date', '==', date)
    )
    const snap = await getDocs(q)
    for (const d of snap.docs) {
      await deleteDoc(doc(db, 'institutos', institutoActivo, 'attendance', d.id))
    }
  }

  async function switchInstituto(id) {
    setInstitutoActivo(id)
  }

  return (
    <AttendanceContext.Provider value={{
      attendance, registerAttendance, resetAttendance,
      switchInstituto, institutoActivo,
      materias, addMateria, deleteMateria
    }}>
      {children}
    </AttendanceContext.Provider>
  )
}