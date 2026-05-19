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
  const orgNombre = orgInfo?.nombre || 'Sistema Automático de Registro Vianntto'

  const ultimaEncuesta = encuestas.length > 0 ? encuestas[encuestas.length - 1] : null

  return (
    <main className="qr-display-shell">
      <div className="qr-display-brand">
        <img src="/logo-vianntto.svg" alt="Vianntto" className="qr-display-logo" />
        <p className="qr-display-brand-name">{orgNombre}</p>
      </div>

      <div className="qr-display-grid">
        {proyectos.map((proy) => (
          <div key={proy.id} className="qr-display-card">
            <QRCodeCanvas value={qrUrl(organizacionActiva, proy.nombre)} size={180} includeMargin fgColor="#838B9B" />
            <span className="qr-display-card-label">Registro</span>
            <p className="qr-display-card-title">{proy.nombre}</p>
          </div>
        ))}

        {ultimaEncuesta && (
          <div className="qr-display-card">
            <QRCodeCanvas value={surQrUrl(organizacionActiva, ultimaEncuesta.id, '')} size={180} includeMargin fgColor="#838B9B" />
            <span className="qr-display-card-label">Encuesta</span>
            <p className="qr-display-card-title">{ultimaEncuesta.preguntas?.length || 0} preguntas</p>
          </div>
        )}
      </div>

      {proyectos.length === 0 && !ultimaEncuesta && (
        <p className="qr-display-empty">No hay proyectos ni encuestas disponibles.</p>
      )}
    </main>
  )
}
