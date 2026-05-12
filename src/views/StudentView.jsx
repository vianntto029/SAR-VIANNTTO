import { useState, useEffect } from 'react'
import { Check, UserCheck } from 'lucide-react'
import { useAttendance, todayKey, dailyCode, INSTITUTOS } from '../context/AttendanceContext'
import '../App.css'

export default function StudentView() {
  const { registerAttendance } = useAttendance()

  const urlParams = new URLSearchParams(window.location.search)
  const materiaParam = urlParams.get('materia') || ''
  const institutoQR = urlParams.get('instituto')

  const [form, setForm] = useState({
    name: '',
    nationalId: '',
    seccion: '',
    representante: '',
  })
  const [status, setStatus] = useState('')
  const [registered, setRegistered] = useState(false)
  const [registeredName, setRegisteredName] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const code = dailyCode(todayKey())
  const institutoInfo = INSTITUTOS.find(i => i.id === institutoQR)
  const institutoNombre = institutoInfo?.nombre || 'Programa ACAR Sabatino'

  useEffect(() => {
    if (registered && !showSuccess) {
      requestAnimationFrame(() => setShowSuccess(true))
    }
  }, [registered, showSuccess])

  if (!materiaParam) {
    return (
      <main className="student-view-glass">
        <div className="logo-header">
          <img src="/ANAGRAMA FUNDACION.png" alt="Fundacion" className="fundacion-logo" />
          <img src="/LOGO-ACAR.png" alt="Programa ACAR" className="programa-logo" />
        </div>
        <div className="student-form-container glass-fade-in">
            <UserCheck size={20} />
            <span>{institutoNombre}</span>
          </div>
          <h1>Registro de Asistencia</h1>
          <p className="student-subtitle">Este enlace no tiene una materia asignada. Solicita el codigo QR correcto.</p>
        </div>
      </main>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanName = form.name.trim()
    const cleanId = form.nationalId.trim()
    const cleanSeccion = form.seccion.trim()
    const cleanRep = form.representante.trim()

    if (!cleanName || !cleanId || !cleanSeccion) {
      setStatus('Completa todos los campos.')
      return
    }

    setStatus('Registrando...')
    try {
      await registerAttendance({
        name: cleanName,
        subject: materiaParam,
        nationalId: cleanId,
        seccion: cleanSeccion,
        representante: cleanRep,
        instituto: institutoQR,
      })
      setRegisteredName(cleanName)
      setRegistered(true)
      setStatus('')
    } catch (err) {
      if (err.message === 'DUPLICADO') {
        setStatus('Esta cedula ya fue registrada hoy.')
      } else {
        setStatus('Error al registrar. Intenta de nuevo.')
      }
    }
  }

return (
    <main className="student-view-glass">
      <div className="logo-header">
        <img src="/ANAGRAMA FUNDACION.png" alt="Fundacion" className="fundacion-logo" />
        <img src="/LOGO-ACAR.png" alt="Programa ACAR" className="programa-logo" />
      </div>
      {!registered ? (
        <div className="student-form-container glass-fade-in">
          <div className="student-brand">
            <UserCheck size={20} />
            <span>{institutoNombre}</span>
          </div>
          <div className="student-materia-header">
            {materiaParam}
          </div>
          <h1>Registro de Asistencia</h1>
          <div className="student-form-divider" />

          <form className="student-form-glass" onSubmit={handleSubmit}>
            <label>
              Nombre del joven
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ej. Juan Perez"
                required
              />
            </label>
            <label>
              Cedula
              <input
                value={form.nationalId}
                onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value }))}
                placeholder="Ej. V-12345678"
                required
              />
            </label>
            <label>
              Seccion / Grupo
              <input
                value={form.seccion}
                onChange={(e) => setForm((f) => ({ ...f, seccion: e.target.value }))}
                placeholder="Ej. Sabatino A"
                required
              />
            </label>
            <div className="representante-badge">
              <UserCheck size={14} />
              Datos del Representante
            </div>
            <label>
              Nombre del representante
              <input
                value={form.representante}
                onChange={(e) => setForm((f) => ({ ...f, representante: e.target.value }))}
                placeholder="Ej. Maria Perez"
              />
            </label>
            <button className="primary" type="submit">
              <Check size={18} />
              Registrar asistencia
            </button>
            {status && (
              <div className={status.includes('ya fue') ? 'duplicate-error' : 'status'}>
                {status}
              </div>
            )}
          </form>

          <div className="student-footer">
            <a href="/login" className="admin-link">Panel administrativo</a>
          </div>
        </div>
      ) : (
        <div className={`success-card-glass ${showSuccess ? 'glass-scale-in' : ''}`}>
          <div className="success-icon-glass">
            <Check size={48} />
          </div>
          <div className="success-check-circle" />
          <h1>Registrado!</h1>
          <p className="success-name-glass">{registeredName}</p>
          <p className="success-message-glass">Tu asistencia fue registrada exitosamente.</p>
          <div className="success-badge-glass">
            <span className="success-label">Codigo</span>
            <span className="success-code-glass">{code}</span>
          </div>
        </div>
      )}
    </main>
  )
}