import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import TarjetaCuenta from '../components/TarjetaCuenta'
import UltimosMovimientos from '../components/UltimosMovimientos'
import ResumenStats from '../components/ResumenStats'
import './Dashboard.css'

export default function Dashboard() {
  const { usuario } = useAuth()
  const [cuentas, setCuentas] = useState([])
  const [transacciones, setTransacciones] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: cuentasData } = await supabase
        .from('cuenta')
        .select('*')
        .eq('id_usuario', usuario.id_usuario)

      const ids = cuentasData?.map(c => c.id_cuenta) || []

      const { data: transData } = await supabase
        .from('transaccion')
        .select('*')
        .in('id_cuenta', ids.length > 0 ? ids : [0])
        .order('fecha', { ascending: false })
        .limit(5)

      setCuentas(cuentasData || [])
      setTransacciones(transData || [])
      setCargando(false)
    }

    cargarDatos()
  }, [usuario])

  const saldoTotal = cuentas.reduce((acc, c) => acc + parseFloat(c.saldo), 0)

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-saludo">
              Hola, <span>{usuario?.nombre}</span>
            </h1>
            <p className="dashboard-sub">Bienvenido de vuelta</p>
          </div>
        </div>

        {cargando ? (
          <p className="dashboard-cargando">Cargando...</p>
        ) : (
          <>
            <div className="dashboard-top">
              <ResumenStats saldoTotal={saldoTotal} transacciones={transacciones} />
              <TarjetaCuenta cuentas={cuentas} usuario={usuario} />
            </div>
            <div className="dashboard-bottom">
              <UltimosMovimientos transacciones={transacciones} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}