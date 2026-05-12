import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import {
  Building2,
  CalendarDays,
  Download,
  ExternalLink,
  LogOut,
  Plus,
  QrCode,
  RefreshCcw,
  Trash2,
  Copy,
} from 'lucide-react'
import { useAttendance, todayKey, dailyCode, INSTITUTOS } from '../context/AttendanceContext'
import '../App.css'

const ADMIN_PASSWORD = 'acar2026'

function groupBySubject(rows) {
  return rows.reduce((subjects, row) => {
    const sub = row.subject || 'Sin materia'
    if (!subjects[sub]) subjects[sub] = []
    subjects[sub].push(row)
    return subjects
  }, {})
}

function styleHeaderRow(row) {
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } }
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }
    cell.alignment = { vertical: 'middle', horizontal: 'center' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFBFDBFE' } },
      left: { style: 'thin', color: { argb: 'FFBFDBFE' } },
      bottom: { style: 'thin', color: { argb: 'FFBFDBFE' } },
      right: { style: 'thin', color: { argb: 'FFBFDBFE' } },
    }
  })
}

export default function AdminView() {
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [status, setStatus] = useState('Listo.')
  const [nuevaMateria, setNuevaMateria] = useState('')
  const [selectedMateria, setSelectedMateria] = useState(null)
  const navigate = useNavigate()
  const { attendance, resetAttendance, switchInstituto, institutoActivo, materias, addMateria, deleteMateria } = useAttendance()

  useEffect(() => {
    const auth = localStorage.getItem('admin-auth')
    if (!auth) navigate('/login')
  }, [navigate])

  useEffect(() => {
    setSelectedMateria(null)
  }, [institutoActivo])

  const code = dailyCode(selectedDate)
  const configuredBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL?.replace(/\/$/, '')
  const baseUrl = configuredBaseUrl || window.location.origin

  const qrLink = selectedMateria
    ? `${baseUrl}?instituto=${institutoActivo}&materia=${encodeURIComponent(selectedMateria.nombre)}`
    : null

  const dailyRows = useMemo(
    () => attendance.filter((row) => row.date === selectedDate),
    [attendance, selectedDate],
  )

  async function exportExcel() {
    try {
      const { default: ExcelJS } = await import('exceljs')
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Programa ACAR Sabatino'
      workbook.created = new Date()

      const rowsForDate = attendance.filter(r => r.date === selectedDate)
      const bySubject = groupBySubject(rowsForDate)
      const subjects = Object.keys(bySubject).sort()

      if (subjects.length === 0) {
        setStatus('No hay registros para esta fecha.')
        return
      }

      const year = selectedDate.substring(2, 4)
      const month = selectedDate.substring(5, 7)
      const day = selectedDate.substring(8, 10)
      const dateStr = `${day}-${month}-${year}`

      subjects.forEach((subj) => {
        const rows = bySubject[subj].sort((a, b) => a.time.localeCompare(b.time))
        const safeSubj = subj.replace(/[*?:\/\\[\]|+]/g, '_').replace(/_+/g, '_').trim()
        const sheetName = `${safeSubj}-${dateStr}`.substring(0, 31)
        const ws = workbook.addWorksheet(sheetName)

        ws.mergeCells('A1:I1')
        ws.getCell('A1').value = `${subj} - ${selectedDate}`
        ws.getCell('A1').font = { bold: true, color: { argb: 'FF10202F' }, size: 16 }
        ws.getCell('A1').alignment = { horizontal: 'center' }

        ws.mergeCells('A2:I2')
        ws.getCell('A2').value = `Programa ACAR Sabatino | Total: ${rows.length}`
        ws.getCell('A2').font = { bold: true, color: { argb: 'FF1D4ED8' } }
        ws.getCell('A2').alignment = { horizontal: 'center' }

        const header = ws.addRow(['#', 'Fecha', 'Hora', 'Nombre del joven', 'Cedula', 'Seccion', 'Representante', 'Materia', 'Codigo'])
        styleHeaderRow(header)

        rows.forEach((row, index) => {
          const r = ws.addRow([
            index + 1, row.date, row.time, row.name, row.nationalId, row.seccion || '-', row.representante || '-', row.subject, row.code,
          ])
          r.eachCell((cell) => {
            cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } }
            cell.alignment = { vertical: 'middle' }
          })
        })

        ws.columns = [
          { width: 6 }, { width: 12 }, { width: 10 }, { width: 28 }, { width: 14 }, { width: 16 }, { width: 24 }, { width: 20 }, { width: 24 },
        ]
        ws.views = [{ state: 'frozen', ySplit: 3 }]
        ws.autoFilter = { from: 'A3', to: `I${rows.length + 2}` }
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ACAR-asistencia-${selectedDate}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setStatus(`Excel descargado: ${subjects.length} materia${subjects.length === 1 ? '' : 's'}.`)
    } catch (err) {
      console.error(err)
      setStatus('Error al exportar: ' + (err?.message || 'desconocido'))
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

  function logout() {
    localStorage.removeItem('admin-auth')
    navigate('/login')
  }

  async function handleAddMateria(e) {
    e.preventDefault()
    const clean = nuevaMateria.trim()
    if (!clean) return
    setStatus('Agregando...')
    try {
      await addMateria(clean)
      setNuevaMateria('')
      setStatus('Materia agregada!')
      setTimeout(() => setStatus('Listo.'), 2000)
    } catch (err) {
      setStatus('Error al agregar.')
    }
  }

  async function handleDeleteMateria(id) {
    await deleteMateria(id)
    if (selectedMateria?.id === id) setSelectedMateria(null)
  }

  function openManualForm() {
    const url = `${baseUrl}?instituto=${institutoActivo}${selectedMateria ? `&materia=${encodeURIComponent(selectedMateria.nombre)}` : ''}`
    window.open(url, '_blank')
  }

  function copyLink() {
    if (qrLink) {
      navigator.clipboard.writeText(qrLink)
      setStatus('Enlace copiado!')
      setTimeout(() => setStatus('Listo.'), 2000)
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <h1>Panel de Control - Programa ACAR Sabatino</h1>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={18} />
          Salir
        </button>
      </header>

      <section className="instituto-bar">
        <Building2 size={18} />
        <span>Instituto:</span>
        <select
          value={institutoActivo}
          onChange={(e) => switchInstituto(e.target.value)}
        >
          {INSTITUTOS.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.nombre}
            </option>
          ))}
        </select>
      </section>

      <section className="hero-panel">
        <div className="hero-copy">
          {selectedMateria ? (
            <>
              <h1>QR - {selectedMateria.nombre}</h1>
              <p>Genera el codigo QR para que los jovenes se registren en esta materia.</p>
            </>
          ) : (
            <>
              <h1>Generador de QR - ACAR</h1>
              <p>Selecciona una materia de la lista para generar el codigo QR.</p>
            </>
          )}
        </div>

        {selectedMateria ? (
        <div className="qr-panel" aria-label="Codigo QR">
          <div className="qr-heading">
            <QrCode size={22} />
            <span>{code}</span>
          </div>
          <QRCodeCanvas value={qrLink} size={190} includeMargin />
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
          <p>Selecciona una materia para generar el QR</p>
        </div>
        )}

        <div className="materias-panel">
          <h3>Materias</h3>
          <form className="add-materia-form" onSubmit={handleAddMateria}>
            <input
              type="text"
              placeholder="Nueva materia..."
              value={nuevaMateria}
              onChange={(e) => setNuevaMateria(e.target.value)}
            />
            <button type="submit">
              <Plus size={16} />
              Agregar
            </button>
          </form>
          <ul className="materias-list">
            {materias.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  className={`materia-btn ${selectedMateria?.id === m.id ? 'active' : ''}`}
                  onClick={() => setSelectedMateria(m)}
                >
                  {m.nombre}
                </button>
                <button className="delete-materia" onClick={() => handleDeleteMateria(m.id)} type="button">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
            {!materias.length && <li className="empty-materias">Sin materias. Escribe y presiona Enter.</li>}
          </ul>
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
        <button type="button" onClick={exportExcel}>
          <Download size={18} />
          Descargar Excel
        </button>
        <button type="button" className="danger" onClick={handleResetToday} disabled={!dailyRows.length}>
          <Trash2 size={18} />
          Reiniciar dia
        </button>
      </section>

      <section className="list-panel">
        <div className="list-title">
          <div>
            <h2>Lista del dia</h2>
            <p>
              {dailyRows.length} joven{dailyRows.length === 1 ? '' : 'es'} registrado{dailyRows.length === 1 ? '' : 's'}
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
                <th>Cedula</th>
                <th>Seccion</th>
                <th>Representante</th>
                <th>Materia</th>
              </tr>
            </thead>
            <tbody>
              {dailyRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.time}</td>
                  <td>{row.name}</td>
                  <td>{row.nationalId}</td>
                  <td>{row.seccion || '-'}</td>
                  <td>{row.representante || '-'}</td>
                  <td>{row.subject}</td>
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
        <div className="status">{status}</div>
      </section>
    </main>
  )
}