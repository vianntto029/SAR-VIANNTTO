import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import {
  Building2,
  CalendarDays,
  Check,
  Download,
  ExternalLink,
  LogOut,
  Plus,
  QrCode,
  RefreshCcw,
  Trash2,
  Copy,
  Settings,
  X,
} from 'lucide-react'
import { useAttendance, todayKey, dailyCode, ORGANIZACIONES } from '../context/AttendanceContext'
import { buildAsistenciaWorkbook, buildEncuestaWorkbook, downloadBuffer } from '../utils/excel'
import '../App.css'

let preguntaCounter = 0
function newPregunta() {
  preguntaCounter += 1
  return { id: `q_${preguntaCounter}_${Date.now()}`, texto: '' }
}

function loadPersist(key) {
  try { return JSON.parse(localStorage.getItem(key)) } catch { return null }
}
function savePersist(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}
function clearPersist(keys) {
  keys.forEach(k => { try { localStorage.removeItem(k) } catch {} })
}

export default function AdminView() {
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [status, setStatus] = useState('Listo.')
  const [nuevoProyecto, setNuevoProyecto] = useState('')
  const [selectedProyecto, setSelectedProyecto] = useState(null)

  const [quickOrg, setQuickOrg] = useState('')
  const [quickProy, setQuickProy] = useState('')
  const [quickConfirmed, setQuickConfirmed] = useState(false)

  const [surOrg, setSurOrg] = useState('')
  const [surProy, setSurProy] = useState('')
  const [surEncuestaId, setSurEncuestaId] = useState(null)
  const [surConfirmed, setSurConfirmed] = useState(false)
  const [showSurModal, setShowSurModal] = useState(false)
  const [surPreguntas, setSurPreguntas] = useState([])
  const [surPreguntasGuardadas, setSurPreguntasGuardadas] = useState([])

  const [restored, setRestored] = useState(false)

  const navigate = useNavigate()
  const { attendance, resetAttendance, switchOrganizacion, organizacionActiva, proyectos, addProyecto, deleteProyecto, respuestasEncuesta, encuestas, saveEncuesta, limpiarRespuestasEncuesta } = useAttendance()

  const STORE_NS = `qr_${organizacionActiva}`

  useEffect(() => {
    const auth = localStorage.getItem('admin-auth')
    if (!auth) navigate('/login')
  }, [navigate])

  // Restore from localStorage once on mount
  useEffect(() => {
    const saved = loadPersist(STORE_NS)
    if (saved) {
      if (saved.quickOrg) setQuickOrg(saved.quickOrg)
      if (saved.quickProy) setQuickProy(saved.quickProy)
      if (saved.quickConfirmed) setQuickConfirmed(true)
      if (saved.surOrg) setSurOrg(saved.surOrg)
      if (saved.surProy) setSurProy(saved.surProy)
      if (saved.surEncuestaId) setSurEncuestaId(saved.surEncuestaId)
      if (saved.surConfirmed) setSurConfirmed(true)
      if (saved.surPreguntasGuardadas) setSurPreguntasGuardadas(saved.surPreguntasGuardadas)
    }
    setRestored(true)
  }, []) // only on mount — survives logout/login

  // Auto-persist whenever any QR state changes
  useEffect(() => {
    if (!restored) return
    savePersist(STORE_NS, {
      quickOrg, quickProy, quickConfirmed,
      surOrg, surProy, surEncuestaId, surConfirmed, surPreguntasGuardadas,
    })
  }, [quickOrg, quickProy, quickConfirmed, surOrg, surProy, surEncuestaId, surConfirmed, surPreguntasGuardadas, STORE_NS, restored])

  // Clear selected project when org changes
  useEffect(() => {
    setSelectedProyecto(null)
  }, [organizacionActiva])

  function refreshQR() {
    savePersist(STORE_NS, {
      quickOrg: '', quickProy: '', quickConfirmed: false,
      surOrg, surProy, surEncuestaId, surConfirmed, surPreguntasGuardadas,
    })
    setQuickOrg('')
    setQuickProy('')
    setQuickConfirmed(false)
    setStatus('QR de lista reiniciado.')
    setTimeout(() => setStatus('Listo.'), 2000)
  }

  function refreshSur() {
    savePersist(STORE_NS, {
      quickOrg, quickProy, quickConfirmed,
      surOrg: '', surProy: '', surEncuestaId: null, surConfirmed: false, surPreguntasGuardadas: [],
    })
    setSurOrg('')
    setSurProy('')
    setSurEncuestaId(null)
    setSurConfirmed(false)
    setSurPreguntasGuardadas([])
    setStatus('Encuesta reiniciada.')
    setTimeout(() => setStatus('Listo.'), 2000)
  }

  const code = dailyCode(organizacionActiva, selectedDate)
  const configuredBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL?.replace(/\/$/, '')
  const baseUrl = configuredBaseUrl || window.location.origin

  const qrLink = useMemo(() => {
    if (selectedProyecto) {
      return `${baseUrl}?organizacion=${organizacionActiva}&proyecto=${encodeURIComponent(selectedProyecto.nombre)}`
    }
    if (quickConfirmed && quickProy) {
      return `${baseUrl}?organizacion=${organizacionActiva}&proyecto=${encodeURIComponent(quickProy)}`
    }
    return null
  }, [selectedProyecto, quickConfirmed, quickProy, baseUrl, organizacionActiva])

  const hasQR = selectedProyecto || (quickConfirmed && quickProy)

  const surQrLink = useMemo(() => {
    if (surConfirmed && surEncuestaId) {
      const proyParam = surProy.trim()
      let url = `${baseUrl}/encuesta?organizacion=${organizacionActiva}&encuesta=${surEncuestaId}`
      if (proyParam) url += `&proyecto=${encodeURIComponent(proyParam)}`
      return url
    }
    return null
  }, [surConfirmed, surEncuestaId, surProy, baseUrl, organizacionActiva])

  const dailyRows = useMemo(
    () => attendance.filter((row) => row.date === selectedDate),
    [attendance, selectedDate],
  )

  const encuestaDailyRows = useMemo(
    () => respuestasEncuesta.filter((row) => row.date === selectedDate),
    [respuestasEncuesta, selectedDate],
  )

  async function exportExcel() {
    try {
      const result = await buildAsistenciaWorkbook(attendance, selectedDate)
      if (!result) { setStatus('No hay registros para esta fecha.'); return }
      downloadBuffer(result.buffer, result.filename)
      setStatus(`Excel descargado: ${result.count} proyecto${result.count === 1 ? '' : 's'}.`)
    } catch (err) {
      console.error(err)
      setStatus('Error al exportar: ' + (err?.message || 'desconocido'))
    }
  }

  async function exportExcelEncuesta() {
    try {
      const result = await buildEncuestaWorkbook(respuestasEncuesta, selectedDate, encuestas)
      if (!result) { setStatus('No hay respuestas de encuesta para esta fecha.'); return }
      downloadBuffer(result.buffer, result.filename)
      setStatus(`Excel de encuestas descargado: ${result.count} proyecto(s).`)
    } catch (err) {
      console.error(err)
      setStatus('Error al exportar encuestas: ' + (err?.message || 'desconocido'))
    }
  }

  async function handleResetToday() {
    try {
      await resetAttendance(selectedDate)
      setStatus(`Lista del ${selectedDate} reiniciada.`)
    } catch {
      setStatus('Error al reiniciar.')
    }
  }

  async function handleLimpiarEncuestas() {
    try {
      await limpiarRespuestasEncuesta(selectedDate)
      setStatus(`Respuestas de encuesta del ${selectedDate} eliminadas.`)
    } catch {
      setStatus('Error al limpiar respuestas.')
    }
  }

  function logout() {
    localStorage.removeItem('admin-auth')
    navigate('/login')
  }

  async function handleAddProyecto(e) {
    e.preventDefault()
    const clean = nuevoProyecto.trim()
    if (!clean) return
    setStatus('Agregando...')
    try {
      await addProyecto(clean)
      setNuevoProyecto('')
      setStatus('Proyecto agregado!')
      setTimeout(() => setStatus('Listo.'), 2000)
    } catch (err) {
      setStatus('Error al agregar.')
    }
  }

  async function handleDeleteProyecto(id) {
    await deleteProyecto(id)
    if (selectedProyecto?.id === id) setSelectedProyecto(null)
  }

  function handleQuickConfirm() {
    if (!quickProy.trim()) return
    setQuickConfirmed(true)
    setSelectedProyecto(null)
    setStatus('QR generado!')
    setTimeout(() => setStatus('Listo.'), 2000)
  }

  function openManualForm() {
    if (!hasQR) return
    let url
    if (selectedProyecto) {
      url = `${baseUrl}?organizacion=${organizacionActiva}&proyecto=${encodeURIComponent(selectedProyecto.nombre)}`
    } else {
      url = `${baseUrl}?organizacion=${organizacionActiva}&proyecto=${encodeURIComponent(quickProy)}`
    }
    window.open(url, '_blank')
  }

  function copyLink() {
    if (qrLink) {
      navigator.clipboard.writeText(qrLink)
      setStatus('Enlace copiado!')
      setTimeout(() => setStatus('Listo.'), 2000)
    }
  }

  function openSurManualForm() {
    if (!surQrLink) return
    window.open(surQrLink, '_blank')
  }

  function copySurLink() {
    if (surQrLink) {
      navigator.clipboard.writeText(surQrLink)
      setStatus('Enlace de encuesta copiado!')
      setTimeout(() => setStatus('Listo.'), 2000)
    }
  }

  function openSurModal() {
    setSurPreguntas([newPregunta()])
    setShowSurModal(true)
  }

  function addSurPregunta() {
    setSurPreguntas(prev => [...prev, newPregunta()])
  }

  function removeSurPregunta(id) {
    setSurPreguntas(prev => prev.filter(p => p.id !== id))
  }

  function updateSurPregunta(id, texto) {
    setSurPreguntas(prev => prev.map(p => p.id === id ? { ...p, texto } : p))
  }

  async function finalizeEncuesta() {
    const validas = surPreguntas.filter(p => p.texto.trim())
    if (validas.length === 0) {
      setStatus('Agrega al menos una pregunta.')
      return
    }
    try {
      const id = await saveEncuesta(validas.map(p => ({ texto: p.texto.trim() })))
      setSurEncuestaId(id)
      setSurPreguntasGuardadas(validas.map(p => p.texto.trim()))
      setShowSurModal(false)
      setStatus('Encuesta guardada! Ahora genera el QR.')
      setTimeout(() => setStatus('Listo.'), 3000)
    } catch (err) {
      setStatus('Error al guardar encuesta.')
    }
  }

  function handleSurConfirm() {
    if (!surProy.trim() || !surEncuestaId) return
    setSurConfirmed(true)
    setStatus('QR de encuesta generado!')
    setTimeout(() => setStatus('Listo.'), 2000)
  }

  return (
    <main className="admin-shell">
      {showSurModal && (
        <div className="modal-overlay" onClick={() => setShowSurModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Personalizar Encuesta</h2>
              <button className="modal-close" onClick={() => setShowSurModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">Agrega las preguntas que deseas incluir en la encuesta exploratoria.</p>
              {surPreguntas.map((p, i) => (
                <div key={p.id} className="modal-pregunta-row">
                  <span className="modal-pregunta-num">{i + 1}.</span>
                  <input
                    type="text"
                    className="modal-pregunta-input"
                    placeholder={`Escribe la pregunta ${i + 1}...`}
                    value={p.texto}
                    onChange={(e) => updateSurPregunta(p.id, e.target.value)}
                  />
                  <button className="modal-pregunta-remove" onClick={() => removeSurPregunta(p.id)} type="button">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button className="modal-add-btn" onClick={addSurPregunta} type="button">
                <Plus size={16} />
                Agregar pregunta
              </button>
            </div>
            <div className="modal-footer">
              <button className="primary modal-finalize" onClick={finalizeEncuesta} type="button">
                <Check size={16} />
                Finalizar encuesta
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="admin-header">
        <div className="logo-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="/logo-vianntto.svg" alt="Vianntto" className="fundacion-logo" style={{ height: 50 }} />
          <h1>Panel de Control - SAR Vianntto</h1>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          Salir
        </button>
      </header>

      <section className="organizacion-bar">
        <Building2 size={18} />
        <span>Organización:</span>
        <select
          value={organizacionActiva}
          onChange={(e) => switchOrganizacion(e.target.value)}
        >
          {ORGANIZACIONES.map((org) => (
            <option key={org.id} value={org.id}>
              {org.nombre}
            </option>
          ))}
        </select>
      </section>

      <section className="hero-panel">
        <div className="hero-copy">
          {hasQR ? (
            <>
              <h1>QR - {selectedProyecto ? selectedProyecto.nombre : quickProy}</h1>
              <p>Escanea el codigo QR para registrar participantes en este proyecto.</p>
            </>
          ) : (
            <>
              <h1>Generador de QR</h1>
              <p>Selecciona un proyecto de la lista o genera uno rapido abajo.</p>
            </>
          )}

          <div className="quick-qr-section">
            <div className="quick-qr-field">
              <label>Organización</label>
              <input
                type="text"
                placeholder="Escribe el nombre exacto..."
                value={quickOrg}
                onChange={(e) => { setQuickOrg(e.target.value); setQuickConfirmed(false) }}
              />
              {quickOrg && <span className="quick-label-preview">{quickOrg}</span>}
            </div>
            <div className="quick-qr-field">
              <label>Proyecto</label>
              <input
                type="text"
                placeholder="Escribe el nombre exacto..."
                value={quickProy}
                onChange={(e) => { setQuickProy(e.target.value); setQuickConfirmed(false) }}
              />
              {quickProy && <span className="quick-label-preview">{quickProy}</span>}
            </div>
            <button
              type="button"
              className="primary quick-confirm-btn"
              disabled={!quickProy.trim() || quickConfirmed}
              onClick={handleQuickConfirm}
            >
              <Check size={16} />
              {quickConfirmed ? 'Generado' : 'Generar QR'}
            </button>
          </div>
        </div>

        {hasQR ? (
        <div className="qr-panel" aria-label="Codigo QR">
          <div className="qr-heading">
            <QrCode size={22} />
            <span>{code}</span>
          </div>
          <QRCodeCanvas value={qrLink} size={190} includeMargin fgColor="#838B9B" />
          <p className="qr-link">{qrLink}</p>
          <div className="qr-actions">
            <button type="button" className="qr-action-btn" onClick={openManualForm} title="Abrir formulario">
              <ExternalLink size={16} />
              Abrir
            </button>
            <button type="button" className="qr-action-btn" onClick={copyLink} title="Copiar enlace">
              <Copy size={16} />
            </button>
          </div>
        </div>
        ) : (
        <div className="qr-panel-empty">
          <QrCode size={40} />
          <p>Selecciona o escribe un proyecto para generar el QR</p>
        </div>
        )}

        <div className="proyectos-panel">
          <h3>PROYECTOS</h3>
          <form className="add-proyecto-form" onSubmit={handleAddProyecto}>
            <input
              type="text"
              placeholder="Nuevo proyecto..."
              value={nuevoProyecto}
              onChange={(e) => setNuevoProyecto(e.target.value)}
            />
            <button type="submit">
              <Plus size={16} />
              Agregar
            </button>
          </form>
          <ul className="proyectos-list">
            {proyectos.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={`proyecto-btn ${selectedProyecto?.id === p.id ? 'active' : ''}`}
                  onClick={() => { setSelectedProyecto(p); setQuickConfirmed(false) }}
                >
                  {p.nombre}
                </button>
                <button className="delete-proyecto" onClick={() => handleDeleteProyecto(p.id)} type="button">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
            {!proyectos.length && <li className="empty-proyectos">Sin proyectos. Escribe y presiona Enter.</li>}
          </ul>
        </div>
      </section>

      <section className="encuesta-panel">
        <div className="encuesta-copy">
          <h2>Encuesta Exploratoria</h2>
          <p>Genera el QR para que los participantes llenen la encuesta de satisfaccion.</p>

          <div className="quick-qr-section">
            <div className="quick-qr-field">
              <label>Organización</label>
              <input
                type="text"
                placeholder="Escribe el nombre exacto..."
                value={surOrg}
                onChange={(e) => { setSurOrg(e.target.value); setSurConfirmed(false) }}
              />
              {surOrg && <span className="quick-label-preview">{surOrg}</span>}
            </div>
            <div className="quick-qr-field">
              <label>Proyecto</label>
              <input
                type="text"
                placeholder="Escribe el nombre exacto..."
                value={surProy}
                onChange={(e) => { setSurProy(e.target.value); setSurConfirmed(false) }}
              />
              {surProy && <span className="quick-label-preview">{surProy}</span>}
            </div>
            <button
              type="button"
              className="primary quick-confirm-btn"
              disabled={!surProy.trim() || !surEncuestaId || surConfirmed}
              onClick={handleSurConfirm}
            >
              <Check size={16} />
              {surConfirmed ? 'Generado' : 'Generar QR'}
            </button>
          </div>

          <div className="encuesta-actions">
            <button type="button" className="primary" onClick={openSurModal} style={{ width: '100%', justifyContent: 'center' }}>
              <Settings size={16} />
              Personalizar Encuesta
            </button>
            {surEncuestaId && (
              <span className="encuesta-status-badge">Encuesta configurada</span>
            )}
          </div>
        </div>

        {surQrLink ? (
        <div className="qr-panel" aria-label="QR Encuesta">
          <div className="qr-heading">
            <QrCode size={22} />
            <span>Encuesta: {surProy}</span>
          </div>
          <QRCodeCanvas value={surQrLink} size={190} includeMargin fgColor="#838B9B" />
          <p className="qr-link">{surQrLink}</p>
          <div className="qr-actions">
            <button type="button" className="qr-action-btn" onClick={openSurManualForm} title="Abrir encuesta">
              <ExternalLink size={16} />
              Abrir
            </button>
            <button type="button" className="qr-action-btn" onClick={copySurLink} title="Copiar enlace">
              <Copy size={16} />
            </button>
          </div>
        </div>
        ) : (
        <div className="qr-panel-empty">
          <QrCode size={40} />
          <p>Configura la encuesta y genera el QR</p>
        </div>
        )}

        <div className="encuesta-preview-panel">
          <h3>PREGUNTAS ({surPreguntasGuardadas.length})</h3>
          {surEncuestaId && surPreguntasGuardadas.length > 0 ? (
            <ul className="encuesta-preguntas-list">
              {surPreguntasGuardadas.map((texto, i) => (
                <li key={i} className="encuesta-pregunta-item">
                  <span className="encuesta-pregunta-num">{i + 1}.</span>
                  <span className="encuesta-pregunta-texto">{texto}</span>
                </li>
              ))}
            </ul>
          ) : surEncuestaId ? (
            <div className="encuesta-listado-ok">Encuesta configurada en Firebase</div>
          ) : (
            <div className="empty-proyectos">
              <p>Haz clic en "Personalizar Encuesta" para agregar preguntas.</p>
            </div>
          )}
        </div>
      </section>

      <section className="toolbar" aria-label="Controles de fecha">
        <label>
          <CalendarDays size={18} />
          Fecha activa
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
        </label>
        <button type="button" onClick={() => setSelectedDate(todayKey())}>
          <RefreshCcw size={18} />
          Hoy
        </button>
        <button type="button" className="warning" onClick={refreshQR} disabled={!quickConfirmed}>
          <RefreshCcw size={18} />
          Refrescar QR
        </button>
        <button type="button" className="warning" onClick={refreshSur} disabled={!surConfirmed}>
          <RefreshCcw size={18} />
          Refrescar Encuesta
        </button>
        <button type="button" onClick={exportExcel}>
          <Download size={18} />
          Excel Asistencia
        </button>
        <button type="button" onClick={exportExcelEncuesta}>
          <Download size={18} />
          Excel Encuestas
        </button>
        <button type="button" className="danger" onClick={handleResetToday} disabled={!dailyRows.length}>
          <Trash2 size={18} />
          Reiniciar dia
        </button>
        <button type="button" className="danger" onClick={handleLimpiarEncuestas} disabled={!encuestaDailyRows.length}>
          <Trash2 size={18} />
          Limpiar Encuestas
        </button>
        <button type="button" className="qr-display-btn" onClick={() => window.open('/qr-display', '_blank')}>
          <ExternalLink size={18} />
          Pantalla QR
        </button>
      </section>

      <section className="list-panel">
        <div className="list-title">
          <div>
            <h2>Lista del dia</h2>
            <p>
              {dailyRows.length} participante{dailyRows.length === 1 ? '' : 's'} registrado{dailyRows.length === 1 ? '' : 's'}
            </p>
          </div>
          <span>{selectedDate}</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Nombre</th>
                <th>Cédula</th>
                <th>Departamento</th>
                <th>Organización</th>
                <th>Proyecto</th>
              </tr>
            </thead>
            <tbody>
              {dailyRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.time}</td>
                  <td>{row.name}</td>
                  <td>{row.nationalId}</td>
                  <td>{row.departamento || '-'}</td>
                  <td>{row.organizacion || '-'}</td>
                  <td>{row.proyecto}</td>
                </tr>
              ))}
              {!dailyRows.length && (
                <tr>
                  <td colSpan="6" className="empty">Sin registros para esta fecha.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {dailyRows.length > 0 && (
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{dailyRows.length}</span>
            <span className="stat-label">PARTICIPANTES</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{new Set(dailyRows.map(r => r.proyecto)).size}</span>
            <span className="stat-label">PROYECTOS</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{dailyRows.filter(r => r.departamento && r.departamento !== '-').length}</span>
            <span className="stat-label">CON DEPARTAMENTO</span>
          </div>
        </div>
        )}
      </section>

      <section className="list-panel" style={{ marginTop: 22 }}>
        <div className="list-title">
          <div>
            <h2>Respuestas de Encuesta</h2>
            <p>
              {encuestaDailyRows.length} respuesta{encuestaDailyRows.length === 1 ? '' : 's'}
            </p>
          </div>
          <span>{selectedDate}</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Participante</th>
                <th>Proyecto</th>
                <th>Respuestas</th>
              </tr>
            </thead>
            <tbody>
              {encuestaDailyRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.time}</td>
                  <td>{row.participante || '-'}</td>
                  <td>{row.proyecto || '-'}</td>
                  <td className="respuestas-cell">
                    {row.respuestas && Object.keys(row.respuestas).length > 0 ? (
                      <ul className="respuestas-list-inline">
                        {Object.entries(row.respuestas).map(([key, val], idx) => (
                          <li key={key}><strong>Q{idx + 1}:</strong> {String(val).substring(0, 120)}</li>
                        ))}
                      </ul>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {!encuestaDailyRows.length && (
                <tr>
                  <td colSpan="4" className="empty">Sin respuestas de encuesta para esta fecha.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {encuestaDailyRows.length > 0 && (
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{encuestaDailyRows.length}</span>
            <span className="stat-label">RESPUESTAS</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{new Set(encuestaDailyRows.map(r => r.proyecto)).size}</span>
            <span className="stat-label">PROYECTOS</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{new Set(encuestaDailyRows.map(r => r.encuestaId)).size}</span>
            <span className="stat-label">ENCUESTAS</span>
          </div>
        </div>
        )}
        <div className="status-card">{status}</div>
      </section>
    </main>
  )
}
