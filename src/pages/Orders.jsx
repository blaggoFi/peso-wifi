import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import OrdersTable from '../components/OrdersTable'
import { updateOrderStatus } from '../lib/data'
import { useOrders } from '../lib/useOrders'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAGE_SIZE = 20

export default function Orders() {
  const { orders, setOrders, loading, error, reload } = useOrders()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [saveError, setSaveError] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false
      if (!q) return true
      return (
        String(o.id).includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q)
      )
    })
  }, [orders, query, status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  async function handleStatusChange(id, next) {
    const previous = orders
    setSaveError(null)
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status: next } : o)))
    try {
      await updateOrderStatus(id, next)
    } catch (err) {
      setOrders(previous)
      setSaveError(`Order #${id} wasn't updated: ${err.message}`)
    }
  }

  if (loading) return <div className="page-loading">Loading orders…</div>
  if (error) {
    return (
      <div className="notice notice-error">
        <p>Orders didn't load: {error}</p>
        <button className="btn" onClick={reload}>Try again</button>
      </div>
    )
  }

  return (
    <div className="stack">
      <section className="panel">
        <div className="toolbar">
          <label className="search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search name, email or order #"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1) }}
              aria-label="Search orders"
            />
          </label>
          <div className="segmented" role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={status === f.value ? 'is-active' : ''}
                aria-pressed={status === f.value}
                onClick={() => { setStatus(f.value); setPage(1) }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {saveError && <p className="notice notice-error">{saveError}</p>}

        <p className="muted result-count">
          {filtered.length} {filtered.length === 1 ? 'order' : 'orders'}
        </p>

        <OrdersTable orders={visible} onStatusChange={handleStatusChange} />

        {pageCount > 1 && (
          <nav className="pager" aria-label="Pages">
            <button className="btn btn-quiet" disabled={current === 1} onClick={() => setPage(current - 1)}>
              Previous
            </button>
            <span className="muted">Page {current} of {pageCount}</span>
            <button className="btn btn-quiet" disabled={current === pageCount} onClick={() => setPage(current + 1)}>
              Next
            </button>
          </nav>
        )}
      </section>
    </div>
  )
}
