import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import RevenueChart from '../components/RevenueChart'
import OrdersTable from '../components/OrdersTable'
import { revenueByDay, summarize } from '../lib/data'
import { formatMoney } from '../lib/format'
import { useOrders } from '../lib/useOrders'

export default function Dashboard() {
  const { orders, loading, error, reload } = useOrders()

  if (loading) return <div className="page-loading">Loading orders…</div>
  if (error) {
    return (
      <div className="notice notice-error">
        <p>Orders didn't load: {error}</p>
        <button className="btn" onClick={reload}>Try again</button>
      </div>
    )
  }

  const s = summarize(orders)
  const chart = revenueByDay(orders)
  const chartTotal = chart.reduce((a, d) => a + d.revenue, 0)

  return (
    <div className="stack">
      <section className="stats" aria-label="Last 30 days">
        <StatCard featured label="Revenue, last 30 days" value={formatMoney(s.revenue)} change={s.revenueChange} />
        <StatCard label="Orders" value={s.orders.toLocaleString()} change={s.ordersChange} />
        <StatCard label="Average order" value={formatMoney(s.average)} change={s.averageChange} />
        <StatCard label="Waiting for payment" value={s.pending} note="Orders marked pending" />
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Daily revenue</h2>
            <p className="muted">Past 14 days, {formatMoney(chartTotal)} total</p>
          </div>
        </div>
        <RevenueChart data={chart} />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Latest orders</h2>
          <Link to="/orders" className="link">See all orders</Link>
        </div>
        <OrdersTable orders={orders.slice(0, 6)} />
      </section>
    </div>
  )
}
