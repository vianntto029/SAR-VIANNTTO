import { useState, useEffect } from 'react'
import { Check, ClipboardList } from 'lucide-react'
import { useAttendance, ORGANIZACIONES } from '../context/AttendanceContext'
import '../App.css'

export default function SurveyView() {
  const { getEncuestaById, submitEncuestaResponse } = useAttendance()

  const urlParams = new URLSearchParams(window.location.search)
  const encuestaId = urlParams.get('encuesta') || ''
  const orgId = urlParams.get('organizacion')
  const proyectoParam = urlParams.get('proyecto') || ''

  const [encuesta, setEncuesta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [respuestas, setRespuestas] = useState({})
  const [participante, setParticipante] = useState('')
  const [status, setStatus] = useState('')
  const [registered, setRegistered] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const orgInfo = ORGANIZACIONES.find(o => o.id === orgId)
  const orgNombre = orgInfo?.nombre || 'Sistema Automático de Registro Vianntto'

  useEffect(() => {
    if (!encuestaId) {
      setLoading(false)
      return
    }
    getEncuestaById(encuestaId, orgId)
      .then((data) => {
        setEncuesta(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading survey:', err)
        setLoading(false)
      })
  }, [encuestaId, orgId, getEncuestaById])

  useEffect(() => {
    if (registered && !showSuccess) {
      requestAnimationFrame(() => setShowSuccess(true))
    }
  }, [registered, showSuccess])

  if (!encuestaId) {
    return (
      <main className="student-view-glass">
        <div className="student-form-container glass-fade-in">
          <div className="student-brand">
            <ClipboardList size={20} />
            <span>{orgNombre}</span>
          </div>
          <h1>Encuesta</h1>
          <p className="student-subtitle">Este enlace no tiene una encuesta asignada. Solicita el codigo QR correcto.</p>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="student-view-glass">
        <div className="student-form-container glass-fade-in">
          <p className="student-subtitle">Cargando encuesta...</p>
        </div>
      </main>
    )
  }

  if (!encuesta) {
    return (
      <main className="student-view-glass">
        <div className="student-form-container glass-fade-in">
          <div className="student-brand">
            <ClipboardList size={20} />
            <span>{orgNombre}</span>
          </div>
          <h1>Encuesta no encontrada</h1>
          <p className="student-subtitle">Esta encuesta no existe o ha sido eliminada.</p>
        </div>
      </main>
    )
  }

  const preguntas = encuesta.preguntas || []

  function handleRespuestaChange(index, value) {
    setRespuestas(prev => ({ ...prev, [index]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanNombre = participante.trim()
    if (!cleanNombre) {
      setStatus('Escribe tu nombre.')
      return
    }

    const vacias = preguntas.some((_, i) => !respuestas[i]?.toString().trim())
    if (vacias) {
      setStatus('Responde todas las preguntas.')
      return
    }

    setStatus('Enviando...')
    try {
      await submitEncuestaResponse({
        encuestaId,
        respuestas,
        proyecto: proyectoParam,
        participante: cleanNombre,
        orgId,
      })
      setRegistered(true)
      setStatus('')
    } catch {
      setStatus('Error al enviar. Intenta de nuevo.')
    }
  }

  return (
    <main className="student-view-glass">
      <div className="student-form-container glass-fade-in">
        {!registered ? (
          <div>
            <div className="student-brand">
              <ClipboardList size={20} />
              <span>{orgNombre}</span>
            </div>
            <h1 style={{ margin: '8px 0 4px' }}>Encuesta de Satisfacción</h1>
            <p className="student-subtitle" style={{ marginBottom: 16 }}>
              Responde las siguientes preguntas para ayudarnos a mejorar.
            </p>
            <div className="student-form-divider" style={{ margin: '12px 0' }} />

            <form className="student-form-glass" onSubmit={handleSubmit}>
              <label>
                Tu nombre
                <input
                  value={participante}
                  onChange={(e) => setParticipante(e.target.value)}
                  placeholder="Ej. Juan Perez"
                  required
                />
              </label>

              {preguntas.map((p, i) => (
                <label key={p.id || i}>
                  {p.texto}
                  <input
                    value={respuestas[i] || ''}
                    onChange={(e) => handleRespuestaChange(i, e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    required
                  />
                </label>
              ))}

              <button className="primary" type="submit">
                <Check size={18} />
                Enviar respuestas
              </button>
              {status && (
                <div className={status.includes('Error') || status.includes('Responde') ? 'duplicate-error' : 'status'}>
                  {status}
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className={`success-card-glass ${showSuccess ? 'glass-scale-in' : ''}`}>
            <div className="success-icon-glass">
              <Check size={48} />
            </div>
            <div className="success-check-circle" />
            <h1>Gracias!</h1>
            <p className="success-name-glass">{participante}</p>
            <p className="success-message-glass">Tus respuestas fueron enviadas exitosamente.</p>
          </div>
        )}
      </div>
    </main>
  )
}
