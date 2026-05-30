import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')

   const { data, error } = await supabase
    .from('usuario')
    .select('*')
    .eq('correo', correo)
    .eq('contrasena', contrasena)
    .single()

    console.log('data:', data)
    console.log('error:', error)

    if (error || !data) {
      setError('Correo o contraseña incorrectos')
      setCargando(false)
      return
    }

    login(data)
    navigate('/dashboard')
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">🏦</div>
        <h1 className="login-titulo">Bienvenido</h1>
        <p className="login-subtitulo">Ingresa a tu banca digital</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-campo">
            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="login-campo">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
          <p className="login-register">
            ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
          </p>
        </form>
      </div>
    </div>
  )
}