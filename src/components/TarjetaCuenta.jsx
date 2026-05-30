import './TarjetaCuenta.css'

export default function TarjetaCuenta({ cuentas, usuario }) {
  const cuenta = cuentas[0]

  if (!cuenta) return (
    <div className="tarjeta-vacia">
      <p>No tienes cuentas registradas</p>
    </div>
  )

  return (
    <div className="tarjeta-wrap">
      <div className="tarjeta-card">
        <div className="tarjeta-top">
          <span className="tarjeta-banco">BANCO DIGITAL</span>
          <span className="tarjeta-tipo">{cuenta.tipo_cuenta}</span>
        </div>
        <div className="tarjeta-chip">▣</div>
        <div className="tarjeta-numero">
          •••• •••• •••• {cuenta.numero_cuenta?.slice(-4)}
        </div>
        <div className="tarjeta-bottom">
          <span className="tarjeta-nombre">{usuario?.nombre} {usuario?.apellidos}</span>
          <div className="tarjeta-logo">●●</div>
        </div>
      </div>
      <div className="tarjeta-saldo-label">Saldo disponible</div>
      <div className="tarjeta-saldo">${parseFloat(cuenta.saldo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
    </div>
  )
}