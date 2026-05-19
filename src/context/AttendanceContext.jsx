import { createContext, useContext, useEffect, useState } from 'react'
import { db, ref, push, onValue, remove, get, child } from '../firebase'
import { ORGANIZACIONES } from '../utils/constants'
import { todayKey, currentTime, dailyCode } from '../utils/formatters'

const AttendanceContext = createContext(null)

export { ORGANIZACIONES, todayKey, currentTime, dailyCode }

export function useAttendance() {
  const ctx = useContext(AttendanceContext)
  if (!ctx) throw new Error('useAttendance must be used within AttendanceProvider')
  return ctx
}

export function AttendanceProvider({ children }) {
  const [organizacionActiva, setOrganizacionActiva] = useState(() => {
    return localStorage.getItem('organizacion-activa') || ORGANIZACIONES[0].id
  })
  const [proyectos, setProyectos] = useState([])
  const [attendance, setAttendance] = useState([])
  const [encuestas, setEncuestas] = useState([])
  const [respuestasEncuesta, setRespuestasEncuesta] = useState([])

  useEffect(() => {
    localStorage.setItem('organizacion-activa', organizacionActiva)
  }, [organizacionActiva])

  useEffect(() => {
    const proyectosRef = ref(db, `organizaciones/${organizacionActiva}/proyectos`)
    const unsubscribe = onValue(proyectosRef, (snapshot) => {
      const data = []
      snapshot.forEach((child) => {
        data.push({ ...child.val(), id: child.key })
      })
      setProyectos(data)
    })
    return () => unsubscribe()
  }, [organizacionActiva])

  useEffect(() => {
    const attendanceRef = ref(db, `organizaciones/${organizacionActiva}/attendance`)
    const unsubscribe = onValue(attendanceRef, (snapshot) => {
      const data = []
      snapshot.forEach((child) => {
        data.push({ ...child.val(), id: child.key })
      })
      data.sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time))
      setAttendance(data)
    })
    return () => unsubscribe()
  }, [organizacionActiva])

  useEffect(() => {
    const encuestasRef = ref(db, `organizaciones/${organizacionActiva}/encuestas`)
    const unsubscribe = onValue(encuestasRef, (snapshot) => {
      const data = []
      snapshot.forEach((child) => {
        data.push({ ...child.val(), id: child.key })
      })
      setEncuestas(data)
    })
    return () => unsubscribe()
  }, [organizacionActiva])

  useEffect(() => {
    const respuestasRef = ref(db, `organizaciones/${organizacionActiva}/respuestas_encuesta`)
    const unsubscribe = onValue(respuestasRef, (snapshot) => {
      const data = []
      snapshot.forEach((child) => {
        data.push({ ...child.val(), id: child.key })
      })
      data.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(b.time))
      setRespuestasEncuesta(data)
    })
    return () => unsubscribe()
  }, [organizacionActiva])

  async function addProyecto(nombre) {
    const clean = nombre.trim()
    if (!clean) return
    const exists = proyectos.find(p => p.nombre.toLowerCase() === clean.toLowerCase())
    if (exists) return
    await push(ref(db, `organizaciones/${organizacionActiva}/proyectos`), { nombre: clean })
  }

  async function deleteProyecto(id) {
    await remove(ref(db, `organizaciones/${organizacionActiva}/proyectos/${id}`))
  }

  async function checkDuplicate(nationalId, date) {
    const snapshot = await get(ref(db, `organizaciones/${organizacionActiva}/attendance`))
    let isDuplicate = false
    snapshot.forEach(child => {
      const val = child.val()
      if (val.nationalId && val.nationalId.toLowerCase() === nationalId.toLowerCase() && val.date === date) {
        isDuplicate = true
      }
    })
    return isDuplicate
  }

  async function registerAttendance({ name, proyecto, nationalId, departamento, organizacion, orgId }) {
    const target = orgId || organizacionActiva
    const date = todayKey()
    const code = dailyCode(target, date)

    const duplicate = await checkDuplicate(nationalId, date)
    if (duplicate) {
      throw new Error('DUPLICADO')
    }

    const record = {
      name,
      proyecto,
      nationalId,
      departamento: departamento || '',
      organizacion: organizacion || '',
      date,
      time: currentTime(),
      code,
      orgId: target,
    }
    await push(ref(db, `organizaciones/${target}/attendance`), record)
    return record
  }

  async function resetAttendance(date) {
    const snapshot = await get(ref(db, `organizaciones/${organizacionActiva}/attendance`))
    const toRemove = []
    snapshot.forEach(child => {
      if (child.val().date === date) {
        toRemove.push(child.key)
      }
    })
    for (const key of toRemove) {
      await remove(ref(db, `organizaciones/${organizacionActiva}/attendance/${key}`))
    }
  }

  async function switchOrganizacion(id) {
    setOrganizacionActiva(id)
  }

  async function saveEncuesta(preguntas, orgId) {
    const target = orgId || organizacionActiva
    const record = {
      preguntas,
      createdAt: new Date().toISOString(),
    }
    const result = await push(ref(db, `organizaciones/${target}/encuestas`), record)
    return result.key
  }

  async function getEncuestaById(encuestaId, orgId) {
    const target = orgId || organizacionActiva
    const snapshot = await get(child(ref(db), `organizaciones/${target}/encuestas/${encuestaId}`))
    if (snapshot.exists()) {
      return { ...snapshot.val(), id: encuestaId }
    }
    return null
  }

  async function submitEncuestaResponse({ encuestaId, respuestas, preguntas, proyecto, participante, orgId }) {
    const target = orgId || organizacionActiva
    const date = todayKey()
    const record = {
      encuestaId,
      proyecto: proyecto || '',
      respuestas,
      preguntas,
      date,
      time: currentTime(),
      participante: participante || '',
    }
    await push(ref(db, `organizaciones/${target}/respuestas_encuesta`), record)
    return record
  }

  async function limpiarRespuestasEncuesta(date) {
    const snapshot = await get(ref(db, `organizaciones/${organizacionActiva}/respuestas_encuesta`))
    const toRemove = []
    snapshot.forEach(child => {
      if (child.val().date === date) {
        toRemove.push(child.key)
      }
    })
    for (const key of toRemove) {
      await remove(ref(db, `organizaciones/${organizacionActiva}/respuestas_encuesta/${key}`))
    }
  }

  return (
    <AttendanceContext.Provider value={{
      attendance, registerAttendance, resetAttendance,
      switchOrganizacion, organizacionActiva,
      proyectos, addProyecto, deleteProyecto,
      encuestas, respuestasEncuesta, saveEncuesta, getEncuestaById, submitEncuestaResponse,
      limpiarRespuestasEncuesta,
    }}>
      {children}
    </AttendanceContext.Provider>
  )
}
