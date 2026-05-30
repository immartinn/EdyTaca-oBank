import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import './Operaciones.css'

export default function Operaciones() {
  const { usuario } = useAuth()
  const [cuentas, setCuentas] = useState([])
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null)
  const [operacion, setOperacion] = useState('deposito')
  const [monto, setMonto] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [usuarioDestino, setUsuarioDestino] = useState(null)
  const [buscando, setBuscando] = useState(false)

  useEffect(() => {
    const cargarCuentas = async () => {
      const { data } = await supabase
        .from('cuenta')
        .select('*')
        .eq('id_usuario', usuario.id_usuario)
      setCuentas(data || [])
      if (data && data.length > 0) setCuentaSeleccionada(data[0])
    }
    cargarCuentas()
  }, [usuario])

  const buscarUsuario = async (valor) => {
    setBusqueda(valor)
    setUsuarioDestino(null)
    if (valor.length < 5) return
    setBuscando(true)

    // Buscar por correo
    const { data: porCorreo } = await supabase
      .from('usuario')
      .select('id_usuario, nombre, apellidos, correo')
      .eq('correo', valor)
      .neq('id_usuario', usuario.id_usuario)
      .single()

    if (porCorreo) {
      setUsuarioDestino(porCorreo)
      setBuscando(false)
      return
    }

    // Buscar por número de cuenta CTA
    const { data: cuentaDestino } = await supabase
      .from('cuenta')
      .select('id_usuario, numero_cuenta')
      .eq('numero_cuenta', valor.toUpperCase())
      .single()

    if (cuentaDestino && cuentaDestino.id_usuario !== usuario.id_usuario) {
      const { data: usuarioCuenta } = await supabase
        .from('usuario')
        .select('id_usuario, nombre, apellidos, correo')
        .eq('id_usuario', cuentaDestino.id_usuario)
        .single()
      setUsuarioDestino(usuarioCuenta || null)
    } else {
      setUsuarioDestino(null)
    }

    setBuscando(false)
  }

  const handleOperacion = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje(null)

    const montoNum = parseFloat(monto)

    if (montoNum <= 0 || isNaN(montoNum)) {
      setMensaje({ tipo: 'error', texto: 'Ingresa un monto válido' })
      setCargando(false)
      return
    }

    if (operacion === 'retiro' && montoNum > parseFloat(cuentaSeleccionada.saldo)) {
      setMensaje({ tipo: 'error', texto: 'Saldo insuficiente' })
      setCargando(false)
      return
    }

    if (operacion === 'transferencia') {
      if (!usuarioDestino) {
        setMensaje({ tipo: 'error', texto: 'Ingresa un correo o número de cuenta válido' })
        setCargando(false)
        return
      }

      if (montoNum > parseFloat(cuentaSeleccionada.saldo)) {
        setMensaje({ tipo: 'error', texto: 'Saldo insuficiente para transferir' })
        setCargando(false)
        return
      }

      const { data: cuentaDestino } = await supabase
        .from('cuenta')
        .select('*')
        .eq('id_usuario', usuarioDestino.id_usuario)
        .single()

      if (!cuentaDestino) {
        setMensaje({ tipo: 'error', texto: 'El destinatario no tiene cuenta bancaria' })
        setCargando(false)
        return
      }

      const nuevoSaldoOrigen = parseFloat(cuentaSeleccionada.saldo) - montoNum
      const nuevoSaldoDestino = parseFloat(cuentaDestino.saldo) + montoNum

      await supabase.from('cuenta').update({ saldo: nuevoSaldoOrigen }).eq('id_cuenta', cuentaSeleccionada.id_cuenta)
      await supabase.from('cuenta').update({ saldo: nuevoSaldoDestino }).eq('id_cuenta', cuentaDestino.id_cuenta)

      await supabase.from('transaccion').insert({
        id_cuenta: cuentaSeleccionada.id_cuenta,
        tipo_transaccion: 'transferencia',
        monto: montoNum,
        descripcion: `Transferencia a ${usuarioDestino.nombre} ${usuarioDestino.apellidos}`
      })

      await supabase.from('transaccion').insert({
        id_cuenta: cuentaDestino.id_cuenta,
        tipo_transaccion: 'transferencia',
        monto: montoNum,
        descripcion: `Transferencia de ${usuario.nombre} ${usuario.apellidos}`
      })

      setCuentaSeleccionada({ ...cuentaSeleccionada, saldo: nuevoSaldoOrigen })
      setCuentas(cuentas.map(c =>
        c.id_cuenta === cuentaSeleccionada.id_cuenta
          ? { ...c, saldo: nuevoSaldoOrigen }
          : c
      ))

      setMensaje({ tipo: 'exito', texto: `Transferencia de $${montoNum} enviada a ${usuarioDestino.nombre}` })
      setMonto('')
      setDescripcion('')
      setBusqueda('')
      setUsuarioDestino(null)
      setCargando(false)
      return
    }

    // Depósito o retiro
    const nuevoSaldo = operacion === 'deposito'
      ? parseFloat(cuentaSeleccionada.saldo) + montoNum
      : parseFloat(cuentaSeleccionada.saldo) - montoNum

    await supabase.from('cuenta').update({ saldo: nuevoSaldo }).eq('id_cuenta', cuentaSeleccionada.id_cuenta)

    await supabase.from('transaccion').insert({
      id_cuenta: cuentaSeleccionada.id_cuenta,
      tipo_transaccion: operacion,
      monto: montoNum,
      descripcion: descripcion || null
    })

    setCuentaSeleccionada({ ...cuentaSeleccionada, saldo: nuevoSaldo })
    setCuentas(cuentas.map(c =>
      c.id_cuenta === cuentaSeleccionada.id_cuenta
        ? { ...c, saldo: nuevoSaldo }
        : c
    ))

    setMensaje({ tipo: 'exito', texto: `${operacion === 'deposito' ? 'Depósito' : 'Retiro'} realizado correctamente` })
    setMonto('')
    setDescripcion('')
    setCargando(false)
  }

  return (
    <div className="op-layout">
      <Sidebar />
      <main className="op-main">
        <div className="op-header">
          <h1 className="op-titulo">Operaciones</h1>
          <p className="op-sub">Realiza depósitos, retiros y transferencias</p>
        </div>

        <div className="op-grid">

          {/* Selector de cuenta */}
          <div className="op-card">
            <h3 className="op-card-titulo">Tus cuentas</h3>
            <div className="op-cuentas">
              {cuentas.map(c => (
                <button
                  key={c.id_cuenta}
                  className={`op-cuenta-item ${cuentaSeleccionada?.id_cuenta === c.id_cuenta ? 'activa' : ''}`}
                  onClick={() => setCuentaSeleccionada(c)}
                >
                  <div className="op-cuenta-info">
                    <span className="op-cuenta-num">{c.numero_cuenta}</span>
                    <span className="op-cuenta-tipo">{c.tipo_cuenta}</span>
                  </div>
                  <span className="op-cuenta-saldo">
                    ${parseFloat(c.saldo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Formulario */}
          <div className="op-card">
            <h3 className="op-card-titulo">Nueva operación</h3>

            {cuentaSeleccionada && (
              <div className="op-saldo-actual">
                <span>Saldo actual</span>
                <strong>${parseFloat(cuentaSeleccionada.saldo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
              </div>
            )}

            <form onSubmit={handleOperacion} className="op-form">

              {/* Tabs arriba */}
              <div className="op-tabs">
                <button
                  type="button"
                  className={`op-tab ${operacion === 'deposito' ? 'activo' : ''}`}
                  onClick={() => { setOperacion('deposito'); setMensaje(null) }}
                >
                  ↓ Depósito
                </button>
                <button
                  type="button"
                  className={`op-tab ${operacion === 'retiro' ? 'activo' : ''}`}
                  onClick={() => { setOperacion('retiro'); setMensaje(null) }}
                >
                  ↑ Retiro
                </button>
                <button
                  type="button"
                  className={`op-tab ${operacion === 'transferencia' ? 'activo' : ''}`}
                  onClick={() => { setOperacion('transferencia'); setMensaje(null) }}
                >
                  ↔ Transferencia
                </button>
              </div>

              <div className="op-campo">
                <label>Monto</label>
                <div className="op-input-monto">
                  <span>$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="op-campo">
                <label>Descripción <span className="op-opcional">(opcional)</span></label>
                <input
                  type="text"
                  placeholder="Ej. Pago de renta"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              {/* Campo transferencia debajo de descripción */}
              {operacion === 'transferencia' && (
                <div className="op-campo">
                  <label>Correo o número de cuenta destino</label>
                  <input
                    type="text"
                    placeholder="correo@ejemplo.com o CTA0000000001"
                    value={busqueda}
                    onChange={e => buscarUsuario(e.target.value)}
                  />
                  {buscando && <span className="op-buscando">Buscando...</span>}
                  {busqueda.length >= 5 && !buscando && (
                    usuarioDestino ? (
                      <div className="op-usuario-encontrado">
                        ✓ {usuarioDestino.nombre} {usuarioDestino.apellidos} — {usuarioDestino.correo}
                      </div>
                    ) : (
                      <div className="op-usuario-no-encontrado">
                        Usuario no encontrado
                      </div>
                    )
                  )}
                </div>
              )}

              {mensaje && (
                <div className={`op-mensaje ${mensaje.tipo}`}>
                  {mensaje.texto}
                </div>
              )}

              <button type="submit" className="op-btn" disabled={cargando || !cuentaSeleccionada}>
                {cargando ? 'Procesando...' : `Realizar ${operacion}`}
              </button>

            </form>
          </div>

        </div>
      </main>
    </div>
  )
}