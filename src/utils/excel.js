import { SHORT_CODE } from './constants'

function groupByProyecto(rows) {
  return rows.reduce((proyectos, row) => {
    const proy = row.proyecto || 'Sin proyecto'
    if (!proyectos[proy]) proyectos[proy] = []
    proyectos[proy].push(row)
    return proyectos
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
    ws.getCell('A1').font = { bold: true, color: { argb: 'FF10202F' }, size: 16 }
    ws.getCell('A1').alignment = { horizontal: 'center' }

    ws.mergeCells('A2:I2')
    ws.getCell('A2').value = `Total: ${rows.length}`
    ws.getCell('A2').font = { bold: true, color: { argb: 'FF1D4ED8' } }
    ws.getCell('A2').alignment = { horizontal: 'center' }

    const header = ws.addRow(['#', 'Fecha', 'Hora', 'Nombre', 'Cédula', 'Departamento', 'Organización', 'Proyecto', 'Código'])
    styleHeaderRow(header)

    rows.forEach((row, index) => {
      const r = ws.addRow([
        index + 1, row.date, row.time, row.name, row.nationalId,
        row.departamento || '-', row.organizacion || '-', row.proyecto, row.code,
      ])
      r.eachCell((cell) => {
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } }
        cell.alignment = { vertical: 'middle' }
      })
    })

    ws.columns = [
      { width: 6 }, { width: 12 }, { width: 10 }, { width: 28 }, { width: 14 },
      { width: 20 }, { width: 24 }, { width: 20 }, { width: 24 },
    ]
    ws.views = [{ state: 'frozen', ySplit: 3 }]
    ws.autoFilter = { from: 'A3', to: `I${rows.length + 2}` }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  return { buffer, filename: `${SHORT_CODE}-asistencia-${selectedDate}.xlsx`, count: proyectos.length }
}

export async function buildEncuestaWorkbook(respuestasEncuesta, selectedDate) {
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

    ws.mergeCells('A1:F1')
    ws.getCell('A1').value = `${proy} - ${selectedDate}`
    ws.getCell('A1').font = { bold: true, color: { argb: 'FF10202F' }, size: 16 }
    ws.getCell('A1').alignment = { horizontal: 'center' }

    ws.mergeCells('A2:F2')
    ws.getCell('A2').value = `Total: ${rows.length}`
    ws.getCell('A2').font = { bold: true, color: { argb: 'FF1D4ED8' } }
    ws.getCell('A2').alignment = { horizontal: 'center' }

    const allRespKeys = new Set()
    rows.forEach(r => {
      if (r.respuestas) Object.keys(r.respuestas).forEach(k => allRespKeys.add(k))
    })
    const respKeys = [...allRespKeys].sort()

    const headers = ['#', 'Fecha', 'Hora', 'Participante', 'Proyecto', ...respKeys.map((_, i) => `Respuesta ${i + 1}`)]
    const headerRow = ws.addRow(headers)
    styleHeaderRow(headerRow)

    rows.sort((a, b) => a.time.localeCompare(b.time)).forEach((row, index) => {
      const respValues = respKeys.map(k => row.respuestas?.[k] || '-')
      const r = ws.addRow([
        index + 1, row.date, row.time, row.participante || '-', row.proyecto || '-', ...respValues,
      ])
      r.eachCell((cell) => {
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } }
        cell.alignment = { vertical: 'middle', wrapText: true }
      })
    })

    ws.columns = [
      { width: 6 }, { width: 12 }, { width: 10 }, { width: 28 }, { width: 24 },
      ...respKeys.map(() => ({ width: 40 })),
    ]
    ws.views = [{ state: 'frozen', ySplit: 3 }]
    ws.autoFilter = { from: 'A3', to: `${String.fromCharCode(64 + headers.length)}${rows.length + 2}` }
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
