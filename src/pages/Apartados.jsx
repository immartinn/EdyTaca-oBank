import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import './Apartados.css'

export default function Apartados() {
  const { usuario } = useAuth()
  const [apartados, setApartados] = useState([])
  const [nombre, setNombre] = useState('')
  const [monto, setMonto] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [cargandoLista, setCargandoLista] = useState(true)

  const sugerencias = ['🌴 Viaje', '🚨 Emergencias', '🛒 Compras', '🎓 Educación', '🏠 Hogar', '💊 Salud']

  useEffect(() => {
    cargarApartados()
  }, [usuario])

  const cargarApartados = async () => {
    const { data } = await supabase
      .from('apartado')
      .select('*')
      .eq('id_usuario', usuario.id_usuario)
      .order('fecha', { ascending: false })
    setApartados(data || [])
    setCargandoLista(false)
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje(null)

    const montoNum = parseFloat(monto)

    if (!nombre.trim()) {
      setMensaje({ tipo: 'error', texto: 'Ingresa un nombre para el apartado' })
      setCargando(false)
      return
    }

    if (montoNum <= 0 || isNaN(montoNum)) {
      setMensaje({ tipo: 'error', texto: 'Ingresa un monto válido' })
      setCargando(false)
      return
    }

    const { error } = await supabase.from('apartado').insert({
      id_usuario: usuario.id_usuario,
      nombre_apartado: nombre,
      monto_guardado: montoNum
    })

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al crear apartado' })
    } else {
      setMensaje({ tipo: 'exito', texto: 'Apartado creado correctamente' })
      setNombre('')
      setMonto('')
      cargarApartados()
    }

    setCargando(false)
  }

  const handleEliminar = async (id) => {
    await supabase.from('apartado').delete().eq('id_apartado', id)
    setApartados(apartados.filter(a => a.id_apartado !== id))
  }

  const totalApartado = apartados.reduce((acc, a) => acc + parseFloat(a.monto_guardado), 0)

  return (
    <div className="apart-layout">
      <Sidebar />
      <main className="apart-main">
        <div className="apart-header">
          <h1 className="apart-titulo">Apartados</h1>
          <p className="apart-sub">Reserva dinero para tus objetivos</p>
        </div>

        <div className="apart-grid">

          {/* Formulario */}
          <div className="apart-card">
            <h3 className="apart-card-titulo">Nuevo apartado</h3>
            <form onSubmit={handleCrear} className="apart-form">

              <div className="apart-campo">
                <label>Nombre del objetivo</label>
                <input
                  type="text"
                  placeholder="Ej. Viaje a Cancún"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  required
                />
              </div>

              <div className="apart-sugerencias">
                {sugerencias.map(s => (
                  <button
                    key={s}
                    type="button"
                    className="apart-sug-btn"
                    onClick={() => setNombre(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="apart-campo">
                <label>Monto a guardar</label>
                <div className="apart-input-monto">
                  <span>$</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {mensaje && (
                <div className={`apart-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
              )}

              <button type="submit" className="apart-btn" disabled={cargando}>
                {cargando ? 'Guardando...' : 'Crear apartado'}
              </button>
            </form>
          </div>

          {/* Lista */}
          <div className="apart-card">
            <div className="apart-lista-header">
              <h3 className="apart-card-titulo">Mis apartados</h3>
              {apartados.length > 0 && (
                <span className="apart-total">
                  Total: ${totalApartado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {cargandoLista ? (
              <p className="apart-vacio">Cargando...</p>
            ) : apartados.length === 0 ? (
              <p className="apart-vacio">Sin apartados registrados</p>
            ) : (
              <div className="apart-lista">
                {apartados.map(a => (
                  <div key={a.id_apartado} className="apart-item">
                    <div className="apart-item-icono">💰</div>
                    <div className="apart-item-info">
                      <span className="apart-item-nombre">{a.nombre_apartado}</span>
                      <span className="apart-item-fecha">{a.fecha}</span>
                    </div>
                    <div className="apart-item-derecha">
                      <span className="apart-item-monto">
                        ${parseFloat(a.monto_guardado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        className="apart-eliminar"
                        onClick={() => handleEliminar(a.id_apartado)}
                        title="Eliminar"
                      >
                        ✕
                      </button>
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