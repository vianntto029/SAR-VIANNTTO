import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAttendance, ORGANIZACIONES } from '../context/AttendanceContext'
import '../App.css'

const MAX_QUESTIONS_PER_PAGE = 5
const MAX_PAGES = 3

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

  useEffect(() => { setPage(0) }, [encuestaId])

  const preguntas = encuesta ? (encuesta.preguntas || []) : []

  const { totalPages, pages } = useMemo(() => {
    if (preguntas.length === 0) return { totalPages: 1, pages: [[]] }
    const maxPerPage = Math.max(1, Math.ceil(preguntas.length / MAX_PAGES))
    const clampedPerPage = Math.max(MAX_QUESTIONS_PER_PAGE, maxPerPage)
    const total = Math.min(MAX_PAGES, Math.ceil(preguntas.length / clampedPerPage))
    const actualPerPage = Math.ceil(preguntas.length / total)
    const result = []
    for (let i = 0; i < total; i++) {
      result.push(preguntas.slice(i * actualPerPage, (i + 1) * actualPerPage))
    }
    return { totalPages: total, pages: result }
  }, [preguntas])

  function handleRespuestaChange(index, value) {
    setRespuestas(prev => ({ ...prev, [index]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanNombre = participante.trim()
    if (!cleanNombre) { setStatus('Escribe tu nombre.'); return }
    const vacias = preguntas.some((_, i) => !respuestas[i]?.toString().trim())
    if (vacias) { setStatus('Responde todas las preguntas.'); return }
    setStatus('Enviando...')
    try {
      await submitEncuestaResponse({ encuestaId, respuestas, preguntas, proyecto: proyectoParam, participante: cleanNombre, orgId })
      setRegistered(true)
      setStatus('')
    } catch { setStatus('Error al enviar. Intenta de nuevo.') }
  }

  if (!encuestaId) return (
    <main className="student-view-glass">
      <div className="student-form-container glass-fade-in">
        <div className="student-brand"><img src="/logo-vianntto.svg" alt="Vianntto" style={{ height: 30, width: 'auto' }} /><span>{orgNombre}</span></div>
        <h1>Encuesta</h1>
        <p className="student-subtitle">Este enlace no tiene una encuesta asignada. Solicita el codigo QR correcto.</p>
      </div>
    </main>
  )
  if (loading) return (
    <main className="student-view-glass">
      <div className="student-form-container glass-fade-in"><p className="student-subtitle">Cargando encuesta...</p></div>
    </main>
  )
  if (!encuesta) return (
    <main className="student-view-glass">
      <div className="student-form-container glass-fade-in">
        <div className="student-brand"><img src="/logo-vianntto.svg" alt="Vianntto" style={{ height: 30, width: 'auto' }} /><span>{orgNombre}</span></div>
        <h1>Encuesta no encontrada</h1>
        <p className="student-subtitle">Esta encuesta no existe o ha sido eliminada.</p>
      </div>
    </main>
  )

  const currentQuestions = pages[page] || []

  return (
    <main className="student-view-glass">
      <div className="student-form-container survey-form-container glass-fade-in">
        {!registered ? (
          <div>
            <div className="student-brand"><img src="/logo-vianntto.svg" alt="Vianntto" style={{ height: 30, width: 'auto' }} /><span>{orgNombre}</span></div>
            <h1 style={{ margin: '20px 0 8px' }}>Encuesta de Satisfacción</h1>
            <p className="student-subtitle" style={{ marginBottom: 20, marginTop: 0 }}>
              Responde las siguientes preguntas para ayudarnos a mejorar.
            </p>
            <div className="student-form-divider" style={{ margin: '16px 0' }} />

            <form className="survey-form" onSubmit={handleSubmit}>
              <label className="survey-name-label">
                Tu nombre
                <input value={participante} onChange={(e) => setParticipante(e.target.value)} placeholder="Ej. Juan Perez" required />
              </label>

              {currentQuestions.map((p, i) => {
                const realIndex = preguntas.indexOf(p)
                return (
                  <label key={p.id || realIndex} className="survey-question-label">
                    <span className="survey-question-text">{p.texto}</span>
                    <input value={respuestas[realIndex] || ''} onChange={(e) => handleRespuestaChange(realIndex, e.target.value)} placeholder="Escribe tu respuesta..." required />
                  </label>
                )
              })}

              {totalPages > 1 && (
                <div className="survey-pagination">
                  <button type="button" className="survey-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                    <ChevronLeft size={18} /> Anterior
                  </button>
                  <span className="survey-page-indicator">{page + 1} / {totalPages}</span>
                  <button type="button" className="survey-page-btn" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                    Siguiente <ChevronRight size={18} />
                  </button>
                </div>
              )}

              <button className="primary" type="submit"><Check size={18} /> Enviar respuestas</button>
              {status && <div className={status.includes('Error') || status.includes('Responde') ? 'duplicate-error' : 'status'}>{status}</div>}
            </form>
          </div>
        ) : (
          <div className={`success-card-glass ${showSuccess ? 'glass-scale-in' : ''}`}>
            <div className="success-icon-glass"><Check size={40} /></div>
            <div className="success-check-circle" />
            <h1>¡GRACIAS POR TU TIEMPO!</h1>
            <p className="success-name-glass">{participante}</p>
          </div>
        )}
      </div>
    </main>
  )
}
