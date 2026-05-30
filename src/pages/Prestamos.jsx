import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import './Prestamos.css'

export default function Prestamos() {
  const { usuario } = useAuth()
  const [prestamos, setPrestamos] = useState([])
  const [monto, setMonto] = useState('')
  const [plazo, setPlazo] = useState('6')
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [cargandoLista, setCargandoLista] = useState(true)

  const INTERES = 0.12 // 12% anual fijo

  useEffect(() => {
    cargarPrestamos()
  }, [usuario])

  const cargarPrestamos = async () => {
    const { data } = await supabase
      .from('prestamo')
      .select('*')
      .eq('id_usuario', usuario.id_usuario)
      .order('fecha_inicio', { ascending: false })
    setPrestamos(data || [])
    setCargandoLista(false)
  }

  const montoNum = parseFloat(monto) || 0
  const interesMensual = INTERES / 12
  const plazoNum = parseInt(plazo)
  const pagoMensual = montoNum > 0
    ? (montoNum * interesMensual) / (1 - Math.pow(1 + interesMensual, -plazoNum))
    : 0
  const totalPagar = pagoMensual * plazoNum

  const handleSolicitar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje(null)

    if (montoNum <= 0) {
      setMensaje({ tipo: 'error', texto: 'Ingresa un monto válido' })
      setCargando(false)
      return
    }

    const { error } = await supabase.from('prestamo').insert({
      id_usuario: usuario.id_usuario,
      monto: montoNum,
      interes: INTERES * 100,
      plazo: plazoNum,
      estado: 'pendiente'
    })

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al solicitar préstamo' })
    } else {
      setMensaje({ tipo: 'exito', texto: 'Préstamo solicitado correctamente' })
      setMonto('')
      setPlazo('6')
      cargarPrestamos()
    }

    setCargando(false)
  }

  const coloresEstado = {
    pendiente: 'amarillo',
    aprobado: 'verde',
    rechazado: 'rojo',
    pagado: 'gris'
  }

  return (
    <div className="prest-layout">
      <Sidebar />
      <main className="prest-main">
        <div className="prest-header">
          <h1 className="prest-titulo">Préstamos</h1>
          <p className="prest-sub">Solicita y consulta tus préstamos</p>
        </div>

        <div className="prest-grid">

          {/* Formulario */}
          <div className="prest-card">
            <h3 className="prest-card-titulo">Solicitar préstamo</h3>
            <form onSubmit={handleSolicitar} className="prest-form">

              <div className="prest-campo">
                <label>Monto solicitado</label>
                <div className="prest-input-monto">
                  <span>$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    min="100"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="prest-campo">
                <label>Plazo</label>
                <div className="prest-plazos">
                  {['3', '6', '12', '24'].map(p => (
                    <button
                      key={p}
                      type="button"
                      className={`prest-plazo-btn ${plazo === p ? 'activo' : ''}`}
                      onClick={() => setPlazo(p)}
                    >
                      {p} meses
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulación */}
              {montoNum > 0 && (
                <div className="prest-simulacion">
                  <h4>Simulación de pago</h4>
                  <div className="prest-sim-fila">
                    <span>Interés anual</span>
                    <strong>{INTERES * 100}%</strong>
                  </div>
                  <div className="prest-sim-fila">
                    <span>Pago mensual</span>
                    <strong className="azul">
                      ${pagoMensual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div className="prest-sim-fila">
                    <span>Total a pagar</span>
                    <strong>
                      ${totalPagar.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              )}

              {mensaje && (
                <div className={`prest-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
              )}

              <button type="submit" className="prest-btn" disabled={cargando}>
                {cargando ? 'Solicitando...' : 'Solicitar préstamo'}
              </button>
            </form>
          </div>

          {/* Lista de préstamos */}
          <div className="prest-card">
            <h3 className="prest-card-titulo">Mis préstamos</h3>
            {cargandoLista ? (
              <p className="prest-vacio">Cargando...</p>
            ) : prestamos.length === 0 ? (
              <p className="prest-vacio">Sin préstamos registrados</p>
            ) : (
              <div className="prest-lista">
                {prestamos.map(p => (
                  <div key={p.id_prestamo} className="prest-item">
                    <div className="prest-item-top">
                      <span className="prest-item-monto">
                        ${parseFloat(p.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <span className={`prest-estado ${coloresEstado[p.estado] || 'gris'}`}>
                        {p.estado}
                      </span>
                    </div>
                    <div className="prest-item-detalle">
                      <span>Plazo: {p.plazo} meses</span>
                      <span>Interés: {p.interes}%</span>
                      <span>Desde: {p.fecha_inicio}</span>
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