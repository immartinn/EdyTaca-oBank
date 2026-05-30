import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import './Perfil.css'

export default function Perfil() {
  const { usuario, login, logout } = useAuth()
  const [editando, setEditando] = useState(false)
  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [apellidos, setApellidos] = useState(usuario?.apellidos || '')
  const [telefono, setTelefono] = useState(usuario?.telefono || '')
  const [direccion, setDireccion] = useState(usuario?.direccion || '')
  const [contrasenaActual, setContrasenaActual] = useState('')
  const [contrasenaNueva, setContrasenaNueva] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [seccion, setSeccion] = useState('info')
  const [confirmando, setConfirmando] = useState(false)


  const handleGuardar = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje(null)

    const { error } = await supabase
      .from('usuario')
      .update({ nombre, apellidos, telefono, direccion })
      .eq('id_usuario', usuario.id_usuario)

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar datos' })
    } else {
      login({ ...usuario, nombre, apellidos, telefono, direccion })
      setMensaje({ tipo: 'exito', texto: 'Datos actualizados correctamente' })
      setEditando(false)
    }

    setCargando(false)
  }

  const handleCambiarContrasena = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje(null)

    if (contrasenaActual !== usuario.contrasena) {
      setMensaje({ tipo: 'error', texto: 'La contraseña actual es incorrecta' })
      setCargando(false)
      return
    }

    if (contrasenaNueva.length < 4) {
      setMensaje({ tipo: 'error', texto: 'La nueva contraseña debe tener al menos 4 caracteres' })
      setCargando(false)
      return
    }

    const { error } = await supabase
      .from('usuario')
      .update({ contrasena: contrasenaNueva })
      .eq('id_usuario', usuario.id_usuario)

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al cambiar contraseña' })
    } else {
      login({ ...usuario, contrasena: contrasenaNueva })
      setMensaje({ tipo: 'exito', texto: 'Contraseña cambiada correctamente' })
      setContrasenaActual('')
      setContrasenaNueva('')
    }

    setCargando(false)
  }

  const handleEliminar = async () => {
  setCargando(true)

  // Eliminar transacciones de sus cuentas
  const { data: cuentas } = await supabase
    .from('cuenta')
    .select('id_cuenta')
    .eq('id_usuario', usuario.id_usuario)

  const ids = cuentas?.map(c => c.id_cuenta) || []

  if (ids.length > 0) {
    await supabase.from('transaccion').delete().in('id_cuenta', ids)
  }

  // Eliminar cuentas, préstamos, apartados, recargas, sesiones
  await supabase.from('cuenta').delete().eq('id_usuario', usuario.id_usuario)
  await supabase.from('prestamo').delete().eq('id_usuario', usuario.id_usuario)
  await supabase.from('apartado').delete().eq('id_usuario', usuario.id_usuario)
  await supabase.from('recarga_tiempo_aire').delete().eq('id_usuario', usuario.id_usuario)
  await supabase.from('sesion').delete().eq('id_usuario', usuario.id_usuario)

  // Eliminar usuario
  await supabase.from('usuario').delete().eq('id_usuario', usuario.id_usuario)

  logout()
  navigate('/login')
  }
  const roles = { 1: 'Administrador', 2: 'Cliente', 3: 'Cajero' }
  const iniciales = `${usuario?.nombre?.[0] || ''}${usuario?.apellidos?.[0] || ''}`.toUpperCase()

  return (
    <div className="perfil-layout">
      <Sidebar />
      <main className="perfil-main">
        <div className="perfil-header">
          <h1 className="perfil-titulo">Perfil</h1>
          <p className="perfil-sub">Administra tu información personal</p>
        </div>

        <div className="perfil-grid">

          {/* Card izquierda — avatar */}
          <div className="perfil-card perfil-avatar-card">
            <div className="perfil-avatar">{iniciales}</div>
            <h2 className="perfil-nombre">{usuario?.nombre} {usuario?.apellidos}</h2>
            <span className="perfil-rol">{roles[usuario?.id_rol] || 'Cliente'}</span>
            <p className="perfil-correo">{usuario?.correo}</p>
            <p className="perfil-registro">
              Miembro desde {new Date(usuario?.fecha_registro).toLocaleDateString('es-MX', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
              <button className="perfil-eliminar-btn" onClick={() => setConfirmando(true)}>
                Eliminar cuenta
              </button>

              {confirmando && (
                <div className="perfil-confirm">
                  <p>¿Estás seguro? Esta acción no se puede deshacer.</p>
                  <div className="perfil-confirm-btns">
                    <button className="perfil-confirm-si" onClick={handleEliminar} disabled={cargando}>
                      {cargando ? 'Eliminando...' : 'Sí, eliminar'}
                    </button>
                    <button className="perfil-confirm-no" onClick={() => setConfirmando(false)}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
          </div>

          {/* Card derecha — formularios */}
          <div className="perfil-card">
            <div className="perfil-tabs">
              <button
                className={`perfil-tab ${seccion === 'info' ? 'activo' : ''}`}
                onClick={() => { setSeccion('info'); setMensaje(null) }}
              >
                Información
              </button>
              <button
                className={`perfil-tab ${seccion === 'contrasena' ? 'activo' : ''}`}
                onClick={() => { setSeccion('contrasena'); setMensaje(null) }}
              >
                Contraseña
              </button>
            </div>

            {seccion === 'info' && (
              <form onSubmit={handleGuardar} className="perfil-form">
                <div className="perfil-fila">
                  <div className="perfil-campo">
                    <label>Nombre</label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      disabled={!editando}
                    />
                  </div>
                  <div className="perfil-campo">
                    <label>Apellidos</label>
                    <input
                      type="text"
                      value={apellidos}
                      onChange={e => setApellidos(e.target.value)}
                      disabled={!editando}
                    />
                  </div>
                </div>

                <div className="perfil-campo">
                  <label>Correo electrónico</label>
                  <input type="email" value={usuario?.correo} disabled />
                </div>

                <div className="perfil-campo">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={e => setTelefono(e.target.value)}
                    disabled={!editando}
                    placeholder="10 dígitos"
                  />
                </div>

                <div className="perfil-campo">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    disabled={!editando}
                    placeholder="Tu dirección"
                  />
                </div>

                {mensaje && seccion === 'info' && (
                  <div className={`perfil-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
                )}

                <div className="perfil-acciones">
                  {!editando ? (
                    <button type="button" className="perfil-btn" onClick={() => setEditando(true)}>
                      Editar información
                    </button>
                  ) : (
                    <>
                      <button type="submit" className="perfil-btn" disabled={cargando}>
                        {cargando ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button
                        type="button"
                        className="perfil-btn-cancel"
                        onClick={() => { setEditando(false); setMensaje(null) }}
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {seccion === 'contrasena' && (
              <form onSubmit={handleCambiarContrasena} className="perfil-form">
                <div className="perfil-campo">
                  <label>Contraseña actual</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={contrasenaActual}
                    onChange={e => setContrasenaActual(e.target.value)}
                    required
                  />
                </div>

                <div className="perfil-campo">
                  <label>Nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={contrasenaNueva}
                    onChange={e => setContrasenaNueva(e.target.value)}
                    required
                  />
                </div>

                {mensaje && seccion === 'contrasena' && (
                  <div className={`perfil-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>
                )}

                <button type="submit" className="perfil-btn" disabled={cargando}>
                  {cargando ? 'Cambiando...' : 'Cambiar contraseña'}
                </button>
              </form>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}