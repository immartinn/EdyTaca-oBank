import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import { generarCSV, generarExcel, generarComprobantePDF } from '../utils/Reportes'
import './Reportes.css'

export default function Reportes() {
  const { usuario } = useAuth()
  const [transacciones, setTransacciones] = useState([])
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(null)
  const [transSeleccionada, setTransSeleccionada] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      const { data: cuentasData } = await supabase
        .from('cuenta')
        .select('*')
        .eq('id_usuario', usuario.id_usuario)

      const ids = cuentasData?.map(c => c.id_cuenta) || []

      const { data: transData } = await supabase
        .from('transaccion')
        .select('*')
        .in('id_cuenta', ids.length > 0 ? ids : [0])
        .order('fecha', { ascending: false })

      setCuentas(cuentasData || [])
      setTransacciones(transData || [])
      setCargando(false)
    }
    cargar()
  }, [usuario])

  const handleCSV = () => {
    setGenerando('csv')
    generarCSV(transacciones, usuario)
    setMensaje({ tipo: 'exito', texto: 'CSV descargado correctamente' })
    setGenerando(null)
  }

  const handleExcel = () => {
    setGenerando('excel')
    generarExcel(transacciones, usuario)
    setMensaje({ tipo: 'exito', texto: 'Excel descargado correctamente' })
    setGenerando(null)
  }

  const handleComprobante = async (t) => {
    setGenerando('pdf-' + t.id_transaccion)
    await generarComprobantePDF(t, usuario, cuentas)
    setGenerando(null)
  }

  const iconos = { deposito: '↓', retiro: '↑', transferencia: '↔', recarga: '📱', prestamo: '🏦' }
  const colores = { deposito: 'verde', retiro: 'rojo', transferencia: 'azul', recarga: 'gris', prestamo: 'gris' }

  return (
    <div className="rep-layout">
      <Sidebar />
      <main className="rep-main">
        <div className="rep-header">
          <h1 className="rep-titulo">Reportes</h1>
          <p className="rep-sub">Descarga tu historial y comprobantes</p>
        </div>

        {/* Botones de descarga */}
        <div className="rep-descargas">
          <div className="rep-descarga-card" onClick={handleCSV}>
            <div className="rep-descarga-icono verde">📄</div>
            <div className="rep-descarga-info">
              <span className="rep-descarga-titulo">Exportar CSV</span>
              <span className="rep-descarga-sub">Todos tus movimientos en formato CSV</span>
            </div>
            <button className="rep-descarga-btn verde" disabled={generando === 'csv' || cargando}>
              {generando === 'csv' ? 'Generando...' : '↓ Descargar'}
            </button>
          </div>

          <div className="rep-descarga-card" onClick={handleExcel}>
            <div className="rep-descarga-icono azul">📊</div>
            <div className="rep-descarga-info">
              <span className="rep-descarga-titulo">Exportar Excel</span>
              <span className="rep-descarga-sub">Estado de cuenta en formato Excel</span>
            </div>
            <button className="rep-descarga-btn azul" disabled={generando === 'excel' || cargando}>
              {generando === 'excel' ? 'Generando...' : '↓ Descargar'}
            </button>
          </div>
        </div>

        {mensaje && (
          <div className={`rep-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
        )}

        {/* Lista de transacciones con comprobante */}
        <div className="rep-card">
          <h3 className="rep-card-titulo">Comprobantes por operación</h3>
          {cargando ? (
            <p className="rep-vacio">Cargando...</p>
          ) : transacciones.length === 0 ? (
            <p className="rep-vacio">Sin movimientos registrados</p>
          ) : (
            <table className="rep-tabla">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Comprobante</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map(t => (
                  <tr key={t.id_transaccion}>
                    <td>
                      <div className="rep-tipo">
                        <span className={`rep-icono ${colores[t.tipo_transaccion] || 'gris'}`}>
                          {iconos[t.tipo_transaccion] || '•'}
                        </span>
                        <span>{t.tipo_transaccion}</span>
                      </div>
                    </td>
                    <td className="rep-desc">{t.descripcion || '—'}</td>
                    <td className="rep-fecha">{t.fecha}</td>
                    <td className={`rep-monto ${t.tipo_transaccion === 'deposito' ? 'positivo' : 'negativo'}`}>
                      {t.tipo_transaccion === 'deposito' ? '+' : '-'}${parseFloat(t.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <button
                        className="rep-comp-btn"
                        onClick={() => handleComprobante(t)}
                        disabled={generando === 'pdf-' + t.id_transaccion}
                      >
                        {generando === 'pdf-' + t.id_transaccion ? '...' : '📄 PDF'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}