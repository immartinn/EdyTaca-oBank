import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'

// ================================
// CSV
// ================================
export function generarCSV(transacciones, usuario) {
  const headers = ['ID', 'Tipo', 'Monto', 'Fecha', 'Hora', 'Descripcion']
  const filas = transacciones.map(t => [
    t.id_transaccion,
    t.tipo_transaccion,
    t.monto,
    t.fecha,
    t.hora || '',
    t.descripcion || ''
  ])

  const contenido = [headers, ...filas]
    .map(fila => fila.map(v => `"${v}"`).join(','))
    .join('\n')

  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `movimientos_${usuario.nombre}_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ================================
// EXCEL (formato HTML tabla)
// ================================
export function generarExcel(transacciones, usuario) {
  const tabla = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial; }
          h2 { color: #1a1a1a; }
          table { border-collapse: collapse; width: 100%; }
          th { background: #1a1a1a; color: white; padding: 8px 12px; text-align: left; }
          td { padding: 8px 12px; border-bottom: 1px solid #eee; }
          .positivo { color: green; font-weight: bold; }
          .negativo { color: red; font-weight: bold; }
        </style>
      </head>
      <body>
        <h2>Estado de Cuenta — ${usuario.nombre} ${usuario.apellidos}</h2>
        <p>Generado el ${new Date().toLocaleDateString('es-MX')}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            ${transacciones.map(t => `
              <tr>
                <td>${t.id_transaccion}</td>
                <td>${t.tipo_transaccion}</td>
                <td class="${t.tipo_transaccion === 'deposito' ? 'positivo' : 'negativo'}">
                  ${t.tipo_transaccion === 'deposito' ? '+' : '-'}$${parseFloat(t.monto).toFixed(2)}
                </td>
                <td>${t.fecha}</td>
                <td>${t.hora || ''}</td>
                <td>${t.descripcion || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  const blob = new Blob([tabla], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `estado_cuenta_${usuario.nombre}_${new Date().toLocaleDateString('es-MX').replace(/\//g, '-')}.xls`
  link.click()
  URL.revokeObjectURL(url)
}

// ================================
// COMPROBANTE PDF + QR
// ================================
export async function generarComprobantePDF(transaccion, usuario, cuentas) {
  const cuenta = cuentas.find(c => c.id_cuenta === transaccion.id_cuenta)

  // Datos para el QR
  const datosQR = JSON.stringify({
    folio: transaccion.id_transaccion,
    tipo: transaccion.tipo_transaccion,
    monto: transaccion.monto,
    fecha: transaccion.fecha,
    cuenta: cuenta?.numero_cuenta || 'N/A'
  })

  // Generar QR como imagen base64
  const qrImagen = await QRCode.toDataURL(datosQR, { width: 150, margin: 1 })

  const doc = new jsPDF()

  // Fondo header
  doc.setFillColor(26, 26, 26)
  doc.rect(0, 0, 210, 40, 'F')

  // Título
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('BANCO DIGITAL', 14, 18)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Comprobante de operación', 14, 28)

  // Folio
  doc.setFontSize(10)
  doc.text(`Folio: #${transaccion.id_transaccion}`, 150, 18)
  doc.text(`Fecha: ${transaccion.fecha}`, 150, 26)
  doc.text(`Hora: ${transaccion.hora?.slice(0, 5) || 'N/A'}`, 150, 34)

  // Info usuario
  doc.setTextColor(26, 26, 26)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Datos del titular', 14, 56)

  autoTable(doc, {
    startY: 60,
    head: [],
    body: [
      ['Nombre', `${usuario.nombre} ${usuario.apellidos}`],
      ['Correo', usuario.correo],
      ['Cuenta', cuenta?.numero_cuenta || 'N/A'],
      ['Tipo de cuenta', cuenta?.tipo_cuenta || 'N/A'],
    ],
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [100, 100, 100] },
      1: { textColor: [26, 26, 26] }
    }
  })

  // Detalle operación
  const y = doc.lastAutoTable.finalY + 10
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Detalle de la operación', 14, y)

  const esDeposito = transaccion.tipo_transaccion === 'deposito'

  autoTable(doc, {
    startY: y + 4,
    head: [],
    body: [
      ['Tipo de operación', transaccion.tipo_transaccion.toUpperCase()],
      ['Monto', `${esDeposito ? '+' : '-'}$${parseFloat(transaccion.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
      ['Descripción', transaccion.descripcion || 'Sin descripción'],
    ],
    theme: 'plain',
    styles: { fontSize: 11, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: [100, 100, 100] },
      1: {
        textColor: esDeposito ? [46, 125, 50] : [198, 40, 40],
        fontStyle: 'bold'
      }
    }
  })

  // QR
  const qrY = doc.lastAutoTable.finalY + 14
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(26, 26, 26)
  doc.text('Código QR de verificación', 14, qrY)
  doc.addImage(qrImagen, 'PNG', 14, qrY + 4, 45, 45)

  // Nota QR
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text('Escanea el QR para verificar esta operación', 64, qrY + 20)

  // Footer
  doc.setFillColor(245, 245, 245)
  doc.rect(0, 272, 210, 25, 'F')
  doc.setTextColor(150, 150, 150)
  doc.setFontSize(9)
  doc.text('Este comprobante es un documento oficial generado por Banco Digital.', 14, 282)
  doc.text(`Generado el ${new Date().toLocaleString('es-MX')}`, 14, 290)

  doc.save(`comprobante_${transaccion.id_transaccion}_${transaccion.fecha}.pdf`)
}