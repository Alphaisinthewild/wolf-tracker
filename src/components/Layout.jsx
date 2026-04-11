import { NavLink, Outlet } from 'react-router-dom'
import useTrackerStore from '../store/useTrackerStore'

const links = [
  { to: '/', label: 'Today' },
  { to: '/log', label: 'Daily Log' },
  { to: '/progress', label: 'Progress' },
  { to: '/trends', label: 'Trends' },
  { to: '/settings', label: 'Settings' },
]

export default function Layout() {
  const status = useTrackerStore(s => s.status)

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h1>WOLF TRACKER</h1>
          <p>Health and fitness, local-first.</p>
        </div>
        <nav>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="status-pill">{status}</div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
