import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, ShoppingBag, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
]

const TITLES = { '/': 'Overview', '/orders': 'Orders' }

export default function Layout() {
  const { user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the phone menu whenever the page changes.
  useEffect(() => setMenuOpen(false), [pathname])

  // Close the phone menu with the Escape key.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="shell">
      <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">A</span>
          <span className="brand-name">WiFi Admin</span>
          <button className="icon-btn sidebar-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link" title={label}>
              <Icon size={20} aria-hidden="true" />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user" title={user?.email}>
            <span className="avatar" aria-hidden="true">{user?.email?.[0]?.toUpperCase()}</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="nav-link" onClick={signOut} title="Sign out">
            <LogOut size={20} aria-hidden="true" />
            <span className="nav-label">Sign out</span>
          </button>
        </div>
      </aside>

      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
          <h1 className="page-title">{TITLES[pathname] ?? 'Admin'}</h1>
          {!isSupabaseConfigured && <span className="demo-pill">Demo data</span>}
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
