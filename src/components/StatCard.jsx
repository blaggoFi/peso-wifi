import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

export default function StatCard({ label, value, change, note, featured = false }) {
  const hasChange = typeof change === 'number' && isFinite(change)
  const up = hasChange && change >= 0

  return (
    <div className={`stat ${featured ? 'stat-featured' : ''}`}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {hasChange ? (
        <p className={`stat-change ${up ? 'is-up' : 'is-down'}`}>
          {up ? <ArrowUpRight size={16} aria-hidden="true" /> : <ArrowDownRight size={16} aria-hidden="true" />}
          {Math.abs(change).toFixed(1)}% vs previous 30 days
        </p>
      ) : (
        note && <p className="stat-note">{note}</p>
      )}
    </div>
  )
}
