import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import './Historial.css'

const TIPOS = ['todos', 'deposito', 'retiro', 'transferencia', 'recarga', 'prestamo']

export default function Historial() {
  const { usuario } = useAuth()
  const [transacciones, setTransacciones] = useState([])
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      const { data: cuentas } = await supabase
        .from('cuenta')
        .select('id_cuenta')
        .eq('id_usuario', usuario.id_usuario)

      const ids = cuentas?.map(c => c.id_cuenta) || []

      const { data } = await supabase
        .from('transaccion')
        .select('*')
        .in('id_cuenta', ids.length > 0 ? ids : [0])
        .order('fecha', { ascending: false })

      setTransacciones(data || [])
      setCargando(false)
    }
    cargar()
  }, [usuario])

  const filtradas = transacciones.filter(t => {
    const coincideTipo = filtroTipo === 'todos' || t.tipo_transaccion === filtroTipo
    const coincideFecha = !filtroFecha || t.fecha === filtroFecha
    return coincideTipo && coincideFecha
  })

  const iconos = { deposito: '↓', retiro: '↑', transferencia: '↔', recarga: '📱', prestamo: '🏦' }
  const colores = { deposito: 'verde', retiro: 'rojo', transferencia: 'azul', recarga: 'gris', prestamo: 'gris' }

  return (
    <div className="hist-layout">
      <Sidebar />
      <main className="hist-main">
        <div className="hist-header">
          <h1 className="hist-titulo">Historial</h1>
          <p className="hist-sub">Todos tus movimientos</p>
        </div>

        {/* Filtros */}
        <div className="hist-filtros">
          <div className="hist-tabs">
            {TIPOS.map(tipo => (
              <button
                key={tipo}
                className={`hist-tab ${filtroTipo === tipo ? 'activo' : ''}`}
                onClick={() => setFiltroTipo(tipo)}
              >
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </button>
            ))}
          </div>
          <input
            type="date"
            className="hist-fecha"
            value={filtroFecha}
            onChange={e => setFiltroFecha(e.target.value)}
          />
        </div>

        {/* Tabla */}
        <div className="hist-card">
          {cargando ? (
            <p className="hist-vacio">Cargando...</p>
          ) : filtradas.length === 0 ? (
            <p className="hist-vacio">Sin movimientos para este filtro</p>
          ) : (
            <table className="hist-tabla">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(t => (
                  <tr key={t.id_transaccion}>
                    <td>
                      <div className="hist-tipo">
                        <span className={`hist-icono ${colores[t.tipo_transaccion] || 'gris'}`}>
                          {iconos[t.tipo_transaccion] || '•'}
                        </span>
                        <span className="hist-tipo-label">{t.tipo_transaccion}</span>
                      </div>
                    </td>
                    <td className="hist-desc">{t.descripcion || '—'}</td>
                    <td className="hist-fecha-col">{t.fecha}</td>
                    <td className="hist-hora">{t.hora?.slice(0, 5) || '—'}</td>
                    <td className={`hist-monto ${t.tipo_transaccion === 'deposito' ? 'positivo' : 'negativo'}`}>
                      {t.tipo_transaccion === 'deposito' ? '+' : '-'}${parseFloat(t.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Resumen */}
        {!cargando && filtradas.length > 0 && (
          <div className="hist-resumen">
            <div className="hist-resumen-item">
              <span>Total movimientos</span>
              <strong>{filtradas.length}</strong>
            </div>
            <div className="hist-resumen-item">
              <span>Total depósitos</span>
              <strong className="positivo">
                +${filtradas.filter(t => t.tipo_transaccion === 'deposito')
                  .reduce((acc, t) => acc + parseFloat(t.monto), 0)
                  .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <div className="hist-resumen-item">
              <span>Total retiros</span>
              <strong className="negativo">
                -${filtradas.filter(t => t.tipo_transaccion === 'retiro')
                  .reduce((acc, t) => acc + parseFloat(t.monto), 0)
                  .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}