import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import './Recargas.css'

const COMPANIAS = ['Telcel', 'AT&T', 'Movistar', 'Unefon', 'Virgin Mobile']
const MONTOS = [30, 50, 100, 150, 200, 300]

export default function Recargas() {
  const { usuario } = useAuth()
  const [recargas, setRecargas] = useState([])
  const [telefono, setTelefono] = useState('')
  const [compania, setCompania] = useState('Telcel')
  const [monto, setMonto] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [cargandoLista, setCargandoLista] = useState(true)

  useEffect(() => {
    cargarRecargas()
  }, [usuario])

  const cargarRecargas = async () => {
    const { data } = await supabase
      .from('recarga_tiempo_aire')
      .select('*')
      .eq('id_usuario', usuario.id_usuario)
      .order('fecha', { ascending: false })
    setRecargas(data || [])
    setCargandoLista(false)
  }

  const handleRecargar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje(null)

    const montoNum = parseFloat(monto)

    if (telefono.length < 10) {
      setMensaje({ tipo: 'error', texto: 'Ingresa un número de teléfono válido (10 dígitos)' })
      setCargando(false)
      return
    }

    if (!montoNum || montoNum <= 0) {
      setMensaje({ tipo: 'error', texto: 'Selecciona un monto' })
      setCargando(false)
      return
    }

    const { error } = await supabase.from('recarga_tiempo_aire').insert({
      id_usuario: usuario.id_usuario,
      numero_telefono: telefono,
      compania,
      monto: montoNum
    })

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al realizar la recarga' })
    } else {
      setMensaje({ tipo: 'exito', texto: `Recarga de $${montoNum} realizada a ${telefono}` })
      setTelefono('')
      setMonto('')
      cargarRecargas()
    }

    setCargando(false)
  }

  const logoCompania = {
    'Telcel': '🔴',
    'AT&T': '🔵',
    'Movistar': '🟢',
    'Unefon': '🟠',
    'Virgin Mobile': '💜'
  }

  return (
    <div className="rec-layout">
      <Sidebar />
      <main className="rec-main">
        <div className="rec-header">
          <h1 className="rec-titulo">Recargas</h1>
          <p className="rec-sub">Compra tiempo aire fácil y rápido</p>
        </div>

        <div className="rec-grid">

          {/* Formulario */}
          <div className="rec-card">
            <h3 className="rec-card-titulo">Nueva recarga</h3>
            <form onSubmit={handleRecargar} className="rec-form">

              <div className="rec-campo">
                <label>Número de teléfono</label>
                <input
                  type="tel"
                  placeholder="10 dígitos"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>

              <div className="rec-campo">
                <label>Compañía</label>
                <div className="rec-companias">
                  {COMPANIAS.map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`rec-compania-btn ${compania === c ? 'activa' : ''}`}
                      onClick={() => setCompania(c)}
                    >
                      <span>{logoCompania[c]}</span>
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rec-campo">
                <label>Monto</label>
                <div className="rec-montos">
                  {MONTOS.map(m => (
                    <button
                      key={m}
                      type="button"
                      className={`rec-monto-btn ${monto === String(m) ? 'activo' : ''}`}
                      onClick={() => setMonto(String(m))}
                    >
                      ${m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resumen */}
              {telefono.length === 10 && monto && (
                <div className="rec-resumen">
                  <div className="rec-resumen-fila">
                    <span>Número</span>
                    <strong>{telefono}</strong>
                  </div>
                  <div className="rec-resumen-fila">
                    <span>Compañía</span>
                    <strong>{logoCompania[compania]} {compania}</strong>
                  </div>
                  <div className="rec-resumen-fila">
                    <span>Monto</span>
                    <strong className="azul">${monto}.00</strong>
                  </div>
                </div>
              )}

              {mensaje && (
                <div className={`rec-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
              )}

              <button type="submit" className="rec-btn" disabled={cargando}>
                {cargando ? 'Procesando...' : 'Recargar ahora'}
              </button>
            </form>
          </div>

          {/* Historial recargas */}
          <div className="rec-card">
            <h3 className="rec-card-titulo">Últimas recargas</h3>
            {cargandoLista ? (
              <p className="rec-vacio">Cargando...</p>
            ) : recargas.length === 0 ? (
              <p className="rec-vacio">Sin recargas registradas</p>
            ) : (
              <div className="rec-lista">
                {recargas.map(r => (
                  <div key={r.id_recarga} className="rec-item">
                    <div className="rec-item-icono">📱</div>
                    <div className="rec-item-info">
                      <span className="rec-item-tel">{r.numero_telefono}</span>
                      <span className="rec-item-comp">{logoCompania[r.compania] || '📶'} {r.compania}</span>
                    </div>
                    <div className="rec-item-derecha">
                      <span className="rec-item-monto">
                        ${parseFloat(r.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="rec-item-fecha">{r.fecha}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}