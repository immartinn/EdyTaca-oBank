import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const menu = [
  { icon: '⊞', label: 'Dashboard',   ruta: '/dashboard' },
  { icon: '↕', label: 'Operaciones', ruta: '/operaciones' },
  { icon: '📋', label: 'Historial',   ruta: '/historial' },
  { icon: '🏦', label: 'Préstamos',   ruta: '/prestamos' },
  { icon: '💰', label: 'Apartados', ruta: '/apartados' },
  { icon: '📱', label: 'Recargas', ruta: '/recargas' },
  { icon: '📊', label: 'Reportes', ruta: '/reportes' },
  { icon: '👤', label: 'Perfil',      ruta: '/perfil' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-icon">🏦</span>
      </div>

      <nav className="sidebar-nav">
        {menu.map((item) => (
          <button
            key={item.ruta}
            className={`sidebar-item ${location.pathname === item.ruta ? 'activo' : ''}`}
            onClick={() => navigate(item.ruta)}
            title={item.label}
          >
            <span className="sidebar-icon">{item.icon}</span>
          </button>
        ))}
      </nav>

      <button className="sidebar-item sidebar-logout" onClick={handleLogout} title="Cerrar sesión">
        <span className="sidebar-icon">⇥</span>
      </button>
    </aside>
  )
  
}

