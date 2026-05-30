import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Register.css'

export default function Register() {
  const [form, setForm] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: '',
    direccion: '',
    contrasena: '',
    confirmar: ''
  })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (form.contrasena !== form.confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (form.contrasena.length < 4) {
      setError('La contraseña debe tener al menos 4 caracteres')
      return
    }

    setCargando(true)

    // Verificar si el correo ya existe
    const { data: existe } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('correo', form.correo)
      .single()

    if (existe) {
      setError('Ya existe una cuenta con ese correo')
      setCargando(false)
      return
    }

    // Crear usuario
    const { error } = await supabase.from('usuario').insert({
      id_rol: 2,
      nombre: form.nombre,
      apellidos: form.apellidos,
      correo: form.correo,
      telefono: form.telefono,
      direccion: form.direccion,
      contrasena: form.contrasena
    })

    if (error) {
      setError('Error al crear la cuenta, intenta de nuevo')
      setCargando(false)
      return
    }

    // Obtener el id del usuario recién creado
    const { data: nuevoUsuario } = await supabase
      .from('usuario')
      .select('id_usuario')
      .eq('correo', form.correo)
      .single()

    // Crear cuenta bancaria automáticamente
    await supabase.from('cuenta').insert({
      id_usuario: nuevoUsuario.id_usuario,
      saldo: 0.00,
      tipo_cuenta: 'ahorro'
    })

    navigate('/login')
  }

  return (
    <div className="reg-bg">
      <div className="reg-card">
        <div className="reg-logo">🏦</div>
        <h1 className="reg-titulo">Crear cuenta</h1>
        <p className="reg-subtitulo">Únete a la banca digital</p>

        <form onSubmit={handleRegister} className="reg-form">

          <div className="reg-fila">
            <div className="reg-campo">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="reg-campo">
              <label>Apellidos</label>
              <input
                type="text"
                name="apellidos"
                placeholder="Tus apellidos"
                value={form.apellidos}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="reg-campo">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="correo"
              placeholder="correo@ejemplo.com"
              value={form.correo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="reg-fila">
            <div className="reg-campo">
              <label>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                placeholder="10 dígitos"
                value={form.telefono}
                onChange={handleChange}
                maxLength={10}
              />
            </div>
            <div className="reg-campo">
              <label>Dirección <span className="reg-opcional">(opcional)</span></label>
              <input
                type="text"
                name="direccion"
                placeholder="Tu dirección"
                value={form.direccion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="reg-fila">
            <div className="reg-campo">
              <label>Contraseña</label>
              <input
                type="password"
                name="contrasena"
                placeholder="••••••••"
                value={form.contrasena}
                onChange={handleChange}
                required
              />
            </div>
            <div className="reg-campo">
              <label>Confirmar contraseña</label>
              <input
                type="password"
                name="confirmar"
                placeholder="••••••••"
                value={form.confirmar}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && <p className="reg-error">{error}</p>}

          <button type="submit" className="reg-btn" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="reg-login">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>

        </form>
      </div>
    </div>
  )
}