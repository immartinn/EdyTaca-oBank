import './ResumenStats.css'

export default function ResumenStats({ saldoTotal, transacciones }) {
  const depositos = transacciones
    .filter(t => t.tipo_transaccion === 'deposito')
    .reduce((acc, t) => acc + parseFloat(t.monto), 0)

  const retiros = transacciones
    .filter(t => t.tipo_transaccion === 'retiro')
    .reduce((acc, t) => acc + parseFloat(t.monto), 0)

  return (
    <div className="stats-wrap">
      <div className="stats-header">
        <span className="stats-titulo">Balance total</span>
      </div>
      <div className="stats-saldo">
        ${saldoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </div>
      <p className="stats-sub">Suma de todas tus cuentas</p>

      <div className="stats-fila">
        <div className="stats-item">
          <span className="stats-dot deposito"></span>
          <div>
            <p className="stats-item-label">Depósitos</p>
            <p className="stats-item-valor">
              ${depositos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="stats-item">
          <span className="stats-dot retiro"></span>
          <div>
            <p className="stats-item-label">Retiros</p>
            <p className="stats-item-valor">
              ${retiros.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}