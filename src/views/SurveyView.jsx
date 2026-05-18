import { useState, useEffect, useMemo, useRef } from 'react'
import { Check, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [page, setPage] = useState(0)
  const formRef = useRef(null)

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

  const preguntas = encuesta ? (encuesta.preguntas || []) : []

  const questionsPerPage = useMemo(() => {
    const baseLines = 280
    const available = window.innerHeight - baseLines
    return Math.max(1, Math.floor(available / 105))
  }, [loading, encuesta])

  const totalPages = preguntas.length > 0 ? Math.ceil(preguntas.length / questionsPerPage) : 1

  const currentQuestions = useMemo(() => {
    const start = page * questionsPerPage
    return preguntas.slice(start, start + questionsPerPage)
  }, [preguntas, page, questionsPerPage])

  useEffect(() => {
    setPage(0)
  }, [encuestaId])

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

  function goNext() {
    if (page < totalPages - 1) setPage(p => p + 1)
  }

  function goPrev() {
    if (page > 0) setPage(p => p - 1)
  }

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

  const isFirst = page === 0
  const isLast = page >= totalPages - 1

  return (
    <main className="student-view-glass">
      <div className="student-form-container survey-form-container glass-fade-in">
        {!registered ? (
          <div ref={formRef}>
            <div className="student-brand">
              <ClipboardList size={20} />
              <span>{orgNombre}</span>
            </div>
            <h1 style={{ margin: '8px 0 4px' }}>Encuesta de Satisfacción</h1>
            <p className="student-subtitle" style={{ marginBottom: 16 }}>
              Responde las siguientes preguntas para ayudarnos a mejorar.
            </p>
            <div className="student-form-divider" style={{ margin: '12px 0' }} />

            <form className="survey-form" onSubmit={handleSubmit}>
              <label className="survey-name-label">
                Tu nombre
                <input
                  value={participante}
                  onChange={(e) => setParticipante(e.target.value)}
                  placeholder="Ej. Juan Perez"
                  required
                />
              </label>

              {currentQuestions.map((p, i) => {
                const realIndex = page * questionsPerPage + i
                return (
                  <label key={p.id || realIndex} className="survey-question-label">
                    <span className="survey-question-text">{p.texto}</span>
                    <input
                      value={respuestas[realIndex] || ''}
                      onChange={(e) => handleRespuestaChange(realIndex, e.target.value)}
                      placeholder="Escribe tu respuesta..."
                      required
                    />
                  </label>
                )
              })}

              {totalPages > 1 && (
                <div className="survey-pagination">
                  <button type="button" className="survey-page-btn" onClick={goPrev} disabled={isFirst}>
                    <ChevronLeft size={18} />
                    Anterior
                  </button>
                  <span className="survey-page-indicator">
                    {page + 1} / {totalPages}
                  </span>
                  <button type="button" className="survey-page-btn" onClick={goNext} disabled={isLast}>
                    Siguiente
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

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
