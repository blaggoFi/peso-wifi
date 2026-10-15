import { useCallback, useEffect, useState } from 'react'
import { fetchOrders } from './data'

/** Loads orders once and exposes loading / error state plus a reload function. */
export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setOrders(await fetchOrders())
    } catch (err) {
      setError(err.message || 'Could not load orders.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { orders, setOrders, loading, error, reload: load }
}
