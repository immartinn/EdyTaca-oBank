import './UltimosMovimientos.css'

const iconos = {
  deposito: '↓',
  retiro: '↑',
  transferencia: '↔',
  recarga: '📱',
  prestamo: '🏦',
}

const colores = {
  deposito: 'verde',
  retiro: 'rojo',
  transferencia: 'azul',
  recarga: 'gris',
  prestamo: 'gris',
}

export default function UltimosMovimientos({ transacciones }) {
  return (
    <div className="movimientos-wrap">
      <div className="movimientos-header">
        <h3 className="movimientos-titulo">Últimos movimientos</h3>
      </div>

      {transacciones.length === 0 ? (
        <p className="movimientos-vacio">Sin movimientos recientes</p>
      ) : (
        <ul className="movimientos-lista">
          {transacciones.map((t) => (
            <li key={t.id_transaccion} className="movimiento-item">
              <div className={`movimiento-icono ${colores[t.tipo_transaccion] || 'gris'}`}>
                {iconos[t.tipo_transaccion] || '•'}
              </div>
              <div className="movimiento-info">
                <span className="movimiento-tipo">{t.tipo_transaccion}</span>
                <span className="movimiento-fecha">{t.fecha} — {t.descripcion || 'Sin descripción'}</span>
              </div>
              <span className={`movimiento-monto ${t.tipo_transaccion === 'deposito' ? 'positivo' : 'negativo'}`}>
                {t.tipo_transaccion === 'deposito' ? '+' : '-'}${parseFloat(t.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}