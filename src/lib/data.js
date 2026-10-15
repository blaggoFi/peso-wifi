import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Loads orders from the Supabase "orders" table.
 * Falls back to sample data when Supabase isn't configured.
 */
export async function fetchOrders() {
  if (!isSupabaseConfigured) return sampleOrders()

  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_name, customer_email, amount, status, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) throw error
  return data
}

export async function updateOrderStatus(id, status) {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

/** Totals for the last `days` days, compared with the period before it. */
export function summarize(orders, days = 30) {
  const now = Date.now()
  const span = days * 86400000
  const inRange = (o, from, to) => {
    const t = new Date(o.created_at).getTime()
    return t >= from && t < to
  }
  const current = orders.filter((o) => inRange(o, now - span, now) && o.status !== 'cancelled')
  const previous = orders.filter((o) => inRange(o, now - 2 * span, now - span) && o.status !== 'cancelled')

  const sum = (list) => list.reduce((acc, o) => acc + Number(o.amount), 0)
  const change = (a, b) => (b === 0 ? null : ((a - b) / b) * 100)

  const revenue = sum(current)
  const prevRevenue = sum(previous)
  const avg = current.length ? revenue / current.length : 0
  const prevAvg = previous.length ? prevRevenue / previous.length : 0

  return {
    revenue,
    revenueChange: change(revenue, prevRevenue),
    orders: current.length,
    ordersChange: change(current.length, previous.length),
    average: avg,
    averageChange: change(avg, prevAvg),
    pending: orders.filter((o) => o.status === 'pending').length,
  }
}

/** Revenue per day for the chart. */
export function revenueByDay(orders, days = 14) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const buckets = new Map()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    buckets.set(d.getTime(), { date: d.toISOString(), revenue: 0 })
  }
  for (const o of orders) {
    if (o.status === 'cancelled') continue
    const d = new Date(o.created_at)
    d.setHours(0, 0, 0, 0)
    const bucket = buckets.get(d.getTime())
    if (bucket) bucket.revenue += Number(o.amount)
  }
  return [...buckets.values()]
}

// ---------- sample data for demo mode ----------
let cache = null
function sampleOrders() {
  if (cache) return cache
  const names = [
    'Maria Santos', 'Juan Dela Cruz', 'Ana Reyes', 'Carlo Mendoza', 'Bea Villanueva',
    'Paolo Garcia', 'Lea Bautista', 'Marco Aquino', 'Rina Castillo', 'Jomar Ramos',
    'Kat Fernandez', 'Miguel Torres', 'Joy Navarro', 'Ivan Domingo', 'Trisha Lim',
  ]
  const statuses = ['paid', 'paid', 'paid', 'shipped', 'shipped', 'pending', 'cancelled']
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

  const orders = []
  for (let i = 0; i < 140; i++) {
    const name = names[Math.floor(rand() * names.length)]
    const created = new Date(Date.now() - Math.floor(rand() * 60) * 86400000 - Math.floor(rand() * 86400000))
    orders.push({
      id: 1000 + i,
      customer_name: name,
      customer_email: name.toLowerCase().replace(/[^a-z]+/g, '.') + '@example.com',
      amount: Math.round(300 + rand() * 4700),
      status: statuses[Math.floor(rand() * statuses.length)],
      created_at: created.toISOString(),
    })
  }
  cache = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return cache
}
