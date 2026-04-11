import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import TodayPage from './pages/TodayPage'
import DailyLogPage from './pages/DailyLogPage'
import ProgressPage from './pages/ProgressPage'
import TrendsPage from './pages/TrendsPage'
import SettingsPage from './pages/SettingsPage'
import SetupPage from './pages/SetupPage'
import useTrackerStore from './store/useTrackerStore'
import './styles/app.css'

export default function App() {
  const initialize = useTrackerStore(s => s.initialize)
  const initialized = useTrackerStore(s => s.initialized)
  const hasCompletedSetup = useTrackerStore(s => s.hasCompletedSetup)

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!initialized) {
    return <div className="loading-screen">Loading Wolf Tracker...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        {!hasCompletedSetup ? (
          <>
            <Route path="/setup" element={<SetupPage />} />
            <Route path="*" element={<Navigate to="/setup" replace />} />
          </>
        ) : (
          <Route element={<Layout />}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/log" element={<DailyLogPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/trends" element={<TrendsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}
