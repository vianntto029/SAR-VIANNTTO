import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { useAttendance, todayKey, dailyCode, ORGANIZACIONES } from '../context/AttendanceContext'
import ViannttoSplash from '../components/ViannttoSplash'
import '../App.css'

export default function StudentView() {
  const { registerAttendance } = useAttendance()

  const urlParams = new URLSearchParams(window.location.search)
  const proyectoParam = urlParams.get('proyecto') || ''
  const organizacionQR = urlParams.get('organizacion')
  const [showSplash, setShowSplash] = useState(() => {
    if (!proyectoParam) return false
    const seen = sessionStorage.getItem('vianntto-splash-seen')
    if (seen) return false
    sessionStorage.setItem('vianntto-splash-seen', 'true')
    return true
  })

  const [form, setForm] = useState({
    name: '',
    nationalId: '',
    departamento: '',
    organizacion: '',
  })
  const [status, setStatus] = useState('')
  const [registered, setRegistered] = useState(false)
  const [registeredName, setRegisteredName] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const code = dailyCode(organizacionQR, todayKey())
  const orgInfo = ORGANIZACIONES.find(o => o.id === organizacionQR)
  const orgNombre = orgInfo?.nombre || 'Sistema Automático de Registro Vianntto'

  useEffect(() => {
    if (registered && !showSuccess) {
      requestAnimationFrame(() => setShowSuccess(true))
    }
  }, [registered, showSuccess])

  if (showSplash) {
    return <ViannttoSplash onComplete={() => setShowSplash(false)} />
  }

  if (!proyectoParam) {
    return (
      <main className="student-view-glass">
        <div className="student-form-container glass-fade-in">
          <div className="student-brand">
            <img src="/isotipo-vianntto.svg" alt="V" style={{ height: 22, width: 'auto' }} />
            <span>{orgNombre}</span>
          </div>
          <h1>Registro</h1>
          <p className="student-subtitle">Este enlace no tiene un proyecto asignado. Solicita el codigo QR correcto.</p>
        </div>
      </main>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanName = form.name.trim()
    const cleanId = form.nationalId.trim()
    const cleanDepto = form.departamento.trim()
    const cleanOrg = form.organizacion.trim()

    if (!cleanName || !cleanId || !cleanDepto) {
      setStatus('Completa todos los campos requeridos.')
      return
    }

    setStatus('Registrando...')
    try {
      await registerAttendance({
        name: cleanName,
        proyecto: proyectoParam,
        nationalId: cleanId,
        departamento: cleanDepto,
        organizacion: cleanOrg,
        orgId: organizacionQR,
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
      <div className="student-form-container glass-fade-in">
        {!registered ? (
          <div>
            <div className="student-brand">
              <img src="/isotipo-vianntto.svg" alt="V" style={{ height: 22, width: 'auto' }} />
              <span>{orgNombre}</span>
            </div>
            <div className="student-proyecto-header" style={{ margin: '8px 0' }}>
              {proyectoParam}
            </div>
            <h1 style={{ margin: '8px 0 4px' }}>Registro</h1>
            <div className="student-form-divider" style={{ margin: '12px 0' }} />

            <form className="student-form-glass" onSubmit={handleSubmit}>
              <label>
                Nombre
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej. Juan Perez"
                  required
                />
              </label>
              <label>
                Cédula
                <input
                  value={form.nationalId}
                  onChange={(e) => setForm((f) => ({ ...f, nationalId: e.target.value }))}
                  placeholder="Ej. V-12345678"
                  required
                />
              </label>
              <label>
                Departamento al que pertenece
                <input
                  value={form.departamento}
                  onChange={(e) => setForm((f) => ({ ...f, departamento: e.target.value }))}
                  placeholder="Ej. Administración"
                  required
                />
              </label>
              <label>
                Organización a la que pertenece
                <input
                  value={form.organizacion}
                  onChange={(e) => setForm((f) => ({ ...f, organizacion: e.target.value }))}
                  placeholder="Ej. Mi Organización"
                />
              </label>
              <button className="primary" type="submit">
                <Check size={18} />
                Registrar
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
            <p className="success-message-glass">Tu registro fue exitoso.</p>
            <div className="success-badge-glass">
              <span className="success-label">Código</span>
              <span className="success-code-glass">{code}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
