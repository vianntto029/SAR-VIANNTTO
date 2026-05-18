import { SHORT_CODE } from './constants'

const ACCENT = 'FFC5AFA8'
const ACCENT_LIGHT = 'FFd2beb8'
const DARK_TEXT = 'FF334155'
const BORDER = 'FFC4C9CE'
const ROW_ALT = 'FFEBEDEF'
const WHITE = 'FFFFFFFF'

function styleHeaderRow(row) {
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ACCENT } }
    cell.font = { color: { argb: WHITE }, bold: true, size: 11, name: 'Calibri' }
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
    cell.border = {
      top: { style: 'thin', color: { argb: BORDER } },
      left: { style: 'thin', color: { argb: BORDER } },
      bottom: { style: 'thin', color: { argb: BORDER } },
      right: { style: 'thin', color: { argb: BORDER } },
    }
  })
}

function styleDataCell(cell, rowIndex) {
  cell.font = { color: { argb: DARK_TEXT }, size: 11, name: 'Calibri' }
  cell.alignment = { vertical: 'middle', wrapText: true }
  cell.border = {
    bottom: { style: 'thin', color: { argb: BORDER } },
  }
  if (rowIndex % 2 === 0) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_ALT } }
  }
}

function styleTitleCell(cell) {
  cell.font = { bold: true, color: { argb: ACCENT }, size: 14, name: 'Calibri' }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
}

function styleSubtitleCell(cell) {
  cell.font = { bold: true, color: { argb: ACCENT_LIGHT }, size: 11, name: 'Calibri' }
  cell.alignment = { horizontal: 'center', vertical: 'middle' }
}

function groupByProyecto(rows) {
  return rows.reduce((proyectos, row) => {
    const proy = row.proyecto || 'Sin proyecto'
    if (!proyectos[proy]) proyectos[proy] = []
    proyectos[proy].push(row)
    return proyectos
  }, {})
}

export async function buildAsistenciaWorkbook(attendance, selectedDate) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Sistema Automático de Registro Vianntto'
  workbook.created = new Date()

  const rowsForDate = attendance.filter(r => r.date === selectedDate)
  const byProyecto = groupByProyecto(rowsForDate)
  const proyectos = Object.keys(byProyecto).sort()

  if (proyectos.length === 0) return null

  const year = selectedDate.substring(2, 4)
  const month = selectedDate.substring(5, 7)
  const day = selectedDate.substring(8, 10)
  const dateStr = `${day}-${month}-${year}`

  proyectos.forEach((proy) => {
    const rows = byProyecto[proy].sort((a, b) => a.time.localeCompare(b.time))
    const safeProy = proy.replace(/[*?:\/\\[\]|+]/g, '_').replace(/_+/g, '_').trim()
    const sheetName = `${safeProy}-${dateStr}`.substring(0, 31)
    const ws = workbook.addWorksheet(sheetName)

    ws.mergeCells('A1:I1')
    ws.getCell('A1').value = `${proy} - ${selectedDate}`
    styleTitleCell(ws.getCell('A1'))
    ws.getRow(1).height = 30

    ws.mergeCells('A2:I2')
    ws.getCell('A2').value = `Total: ${rows.length} participante${rows.length === 1 ? '' : 's'}`
    styleSubtitleCell(ws.getCell('A2'))
    ws.getRow(2).height = 22

    const header = ws.addRow(['#', 'Fecha', 'Hora', 'Nombre', 'Cédula', 'Departamento', 'Organización', 'Proyecto', 'Código'])
    styleHeaderRow(header)
    ws.getRow(3).height = 22

    rows.forEach((row, index) => {
      const r = ws.addRow([
        index + 1, row.date, row.time, row.name, row.nationalId,
        row.departamento || '-', row.organizacion || '-', row.proyecto, row.code,
      ])
      r.eachCell((cell) => styleDataCell(cell, index))
    })

    ws.columns = [
      { width: 6 }, { width: 12 }, { width: 10 }, { width: 30 }, { width: 16 },
      { width: 22 }, { width: 26 }, { width: 22 }, { width: 26 },
    ]
    ws.views = [{ state: 'frozen', ySplit: 3 }]
    ws.autoFilter = { from: 'A3', to: `I${rows.length + 2}` }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return { buffer, filename: `${SHORT_CODE}-asistencia-${selectedDate}.xlsx`, count: proyectos.length }
}

export async function buildEncuestaWorkbook(respuestasEncuesta, selectedDate, encuestas = []) {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Sistema Automático de Registro Vianntto'
  workbook.created = new Date()

  const rowsForDate = respuestasEncuesta.filter(r => r.date === selectedDate)
  if (rowsForDate.length === 0) return null

  const byProyecto = rowsForDate.reduce((acc, row) => {
    const proy = row.proyecto || 'Sin proyecto'
    if (!acc[proy]) acc[proy] = []
    acc[proy].push(row)
    return acc
  }, {})

  const year = selectedDate.substring(2, 4)
  const month = selectedDate.substring(5, 7)
  const day = selectedDate.substring(8, 10)
  const dateStr = `${day}-${month}-${year}`

  Object.entries(byProyecto).forEach(([proy, rows]) => {
    const safeProy = proy.replace(/[*?:\/\\[\]|+]/g, '_').replace(/_+/g, '_').trim()
    const sheetName = `Encuestas-${safeProy}-${dateStr}`.substring(0, 31)
    const ws = workbook.addWorksheet(sheetName)

    const mergedEnd = 'F'
    ws.mergeCells(`A1:${mergedEnd}1`)
    ws.getCell('A1').value = `${proy} - ${selectedDate}`
    styleTitleCell(ws.getCell('A1'))
    ws.getRow(1).height = 30

    ws.mergeCells(`A2:${mergedEnd}2`)
    ws.getCell('A2').value = `Total: ${rows.length} respuesta${rows.length === 1 ? '' : 's'}`
    styleSubtitleCell(ws.getCell('A2'))
    ws.getRow(2).height = 22

    const allRespKeys = new Set()
    rows.forEach(r => {
      if (r.respuestas) Object.keys(r.respuestas).forEach(k => allRespKeys.add(k))
    })
    const respKeys = [...allRespKeys].sort()

    const firstPreguntas = rows.find(r => r.preguntas)?.preguntas || []
    const encuestaData = !firstPreguntas.length ? encuestas.find(e => e.id === rows[0]?.encuestaId) : null
    const preguntasSrc = firstPreguntas.length ? firstPreguntas : (encuestaData?.preguntas || [])
    const headerNames = respKeys.map((k) => {
      const idx = parseInt(k, 10)
      const q = preguntasSrc[idx]
      return q?.texto || q || `Respuesta ${idx + 1}`
    })

    const headers = ['#', 'Fecha', 'Hora', 'Participante', 'Proyecto', ...headerNames]
    const headerRow = ws.addRow(headers)
    styleHeaderRow(headerRow)
    ws.getRow(3).height = 22

    const colCount = headers.length
    const colLetter = colCount <= 26
      ? String.fromCharCode(64 + colCount)
      : 'A' + String.fromCharCode(64 + colCount - 26)

    rows.sort((a, b) => a.time.localeCompare(b.time)).forEach((row, index) => {
      const respValues = respKeys.map(k => row.respuestas?.[k] || '-')
      const r = ws.addRow([
        index + 1, row.date, row.time, row.participante || '-', row.proyecto || '-', ...respValues,
      ])
      r.eachCell((cell) => styleDataCell(cell, index))
    })

    ws.columns = [
      { width: 6 }, { width: 12 }, { width: 10 }, { width: 28 }, { width: 24 },
      ...respKeys.map(() => ({ width: 44 })),
    ]
    ws.views = [{ state: 'frozen', ySplit: 3 }]
    ws.autoFilter = { from: 'A3', to: `${colLetter}${rows.length + 2}` }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return { buffer, filename: `${SHORT_CODE}-encuestas-${selectedDate}.xlsx`, count: Object.keys(byProyecto).length }
}

export function downloadBuffer(buffer, filename) {
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
