import { createContext, useContext, useEffect, useState } from 'react'
import { db, ref, push, onValue, remove, get } from '../firebase'

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
    const materiasRef = ref(db, `institutos/${institutoActivo}/materias`)
    const unsubscribe = onValue(materiasRef, (snapshot) => {
      const data = []
      snapshot.forEach((child) => {
        data.push({ ...child.val(), id: child.key })
      })
      setMaterias(data)
    })
    return () => unsubscribe()
  }, [institutoActivo])

  useEffect(() => {
    const attendanceRef = ref(db, `institutos/${institutoActivo}/attendance`)
    const unsubscribe = onValue(attendanceRef, (snapshot) => {
      const data = []
      snapshot.forEach((child) => {
        data.push({ ...child.val(), id: child.key })
      })
      data.sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time))
      setAttendance(data)
    })
    return () => unsubscribe()
  }, [institutoActivo])

  async function addMateria(nombre) {
    const clean = nombre.trim()
    if (!clean) return
    const exists = materias.find(m => m.nombre.toLowerCase() === clean.toLowerCase())
    if (exists) return
    await push(ref(db, `institutos/${institutoActivo}/materias`), { nombre: clean })
  }

  async function deleteMateria(id) {
    await remove(ref(db, `institutos/${institutoActivo}/materias/${id}`))
  }

  async function checkDuplicate(nationalId, date) {
    const snapshot = await get(ref(db, `institutos/${institutoActivo}/attendance`))
    let isDuplicate = false
    snapshot.forEach(child => {
      const val = child.val()
      if (val.nationalId && val.nationalId.toLowerCase() === nationalId.toLowerCase() && val.date === date) {
        isDuplicate = true
      }
    })
    return isDuplicate
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
    await push(ref(db, `institutos/${target}/attendance`), record)
    return record
  }

  async function resetAttendance(date) {
    const snapshot = await get(ref(db, `institutos/${institutoActivo}/attendance`))
    const toRemove = []
    snapshot.forEach(child => {
      if (child.val().date === date) {
        toRemove.push(child.key)
      }
    })
    for (const key of toRemove) {
      await remove(ref(db, `institutos/${institutoActivo}/attendance/${key}`))
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