import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'

// Pages load on demand, so the chart library only downloads with the dashboard.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Orders = lazy(() => import('./pages/Orders'))

function RequireAuth({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <div className="page-loading">Loading…</div>
  if (!session) return <Navigate to="/login" replace />
  return children
}

const page = (el) => <Suspense fallback={<div className="page-loading">Loading…</div>}>{el}</Suspense>

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={page(<Dashboard />)} />
        <Route path="/orders" element={page(<Orders />)} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
