import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Operaciones from './pages/Operaciones'
import Historial from './pages/Historial'
import Prestamos from './pages/Prestamos'
import Apartados from './pages/Apartados'
import Recargas from './pages/Recargas'
import Perfil from './pages/Perfil'
import Reportes from './pages/Reportes'
import Register from './pages/Register'



function RutaProtegida({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={
        
        <RutaProtegida>
          <Dashboard /> 
        </RutaProtegida>
      } />
      <Route path="/operaciones" element={
        <RutaProtegida>
          <Operaciones />
        </RutaProtegida>
      } />
      <Route path="/historial" element={
        <RutaProtegida>
          <Historial />
        </RutaProtegida>
      } />
      <Route path="/prestamos" element={
        <RutaProtegida>
          <Prestamos />
        </RutaProtegida>
      } />
      <Route path="/apartados" element={
        <RutaProtegida>
          <Apartados />
        </RutaProtegida>
      } />
      <Route path="/recargas" element={
        <RutaProtegida>
          <Recargas />
        </RutaProtegida>
      } />
      <Route path="/perfil" element={
        <RutaProtegida>
          <Perfil />
        </RutaProtegida>
      } />
      <Route path="/reportes" element={
        <RutaProtegida>
          <Reportes />
        </RutaProtegida>
      } />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}