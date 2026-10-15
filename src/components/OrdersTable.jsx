import StatusBadge from './StatusBadge'
import { formatDate, formatMoneyExact } from '../lib/format'

/**
 * A table on tablets and desktops; each row becomes a stacked card on phones
 * (see .orders-table rules in styles.css).
 */
export default function OrdersTable({ orders, onStatusChange }) {
  if (!orders.length) {
    return <p className="empty">No orders match these filters. Clear the search or choose another status.</p>
  }

  return (
    <div className="table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Customer</th>
            <th scope="col">Date</th>
            <th scope="col">Status</th>
            <th scope="col" className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td data-label="Order" className="order-id">#{o.id}</td>
              <td data-label="Customer">
                <span className="customer-name">{o.customer_name}</span>
                {o.customer_email && <span className="customer-email">{o.customer_email}</span>}
              </td>
              <td data-label="Date">{formatDate(o.created_at)}</td>
              <td data-label="Status">
                {onStatusChange ? (
                  <select
                    className={`status-select badge badge-${o.status}`}
                    value={o.status}
                    onChange={(e) => onStatusChange(o.id, e.target.value)}
                    aria-label={`Status for order ${o.id}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                ) : (
                  <StatusBadge status={o.status} />
                )}
              </td>
              <td data-label="Amount" className="num amount">{formatMoneyExact(o.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
