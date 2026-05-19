import { QRCodeCanvas } from 'qrcode.react'
import { useAttendance, ORGANIZACIONES } from '../context/AttendanceContext'
import '../App.css'

const configuredBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL?.replace(/\/$/, '')
const baseUrl = configuredBaseUrl || window.location.origin

function qrUrl(orgId, proyectoNombre) {
  return `${baseUrl}?organizacion=${orgId}&proyecto=${encodeURIComponent(proyectoNombre)}`
}

function surQrUrl(orgId, encuestaId, proyecto) {
  let url = `${baseUrl}/encuesta?organizacion=${orgId}&encuesta=${encuestaId}`
  if (proyecto) url += `&proyecto=${encodeURIComponent(proyecto)}`
  return url
}

export default function QRDisplayView() {
  const { organizacionActiva, proyectos, encuestas } = useAttendance()
  const orgInfo = ORGANIZACIONES.find(o => o.id === organizacionActiva)
  const orgNombre = orgInfo?.nombre || organizacionActiva

  const ultimaEncuesta = encuestas.length > 0 ? encuestas[encuestas.length - 1] : null

  return (
    <main className="qr-display-shell">
      <div className="qr-display-header">
        <img src="/logo-vianntto.svg" alt="Vianntto" style={{ height: 40 }} />
        <div>
          <h1>CÓDIGOS QR</h1>
          <p className="qr-display-org">{orgNombre}</p>
        </div>
      </div>

      <div className="qr-display-grid">
        {proyectos.map((proy) => (
          <div key={proy.id} className="qr-display-card">
            <QRCodeCanvas value={qrUrl(organizacionActiva, proy.nombre)} size={200} includeMargin fgColor="#838B9B" />
            <p className="qr-display-proyecto">{proy.nombre}</p>
            <p className="qr-display-sub">Registro de asistencia</p>
          </div>
        ))}

        {ultimaEncuesta && (
          <div className="qr-display-card qr-display-card-survey">
            <QRCodeCanvas value={surQrUrl(organizacionActiva, ultimaEncuesta.id, '')} size={200} includeMargin fgColor="#16a34a" />
            <p className="qr-display-proyecto">ENCUESTA</p>
            <p className="qr-display-sub">{ultimaEncuesta.preguntas?.length || 0} preguntas</p>
          </div>
        )}
      </div>

      {proyectos.length === 0 && !ultimaEncuesta && (
        <p className="qr-display-empty">No hay proyectos ni encuestas disponibles.</p>
      )}
    </main>
  )
}
