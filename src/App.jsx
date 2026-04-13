import { lazy, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import LazyRoute from './components/LazyRoute'
import TodayPage from './pages/TodayPage'
import DailyLogPage from './pages/DailyLogPage'
import SettingsPage from './pages/SettingsPage'
import SetupPage from './pages/SetupPage'
import useTrackerStore from './store/useTrackerStore'
import { scheduleDailyReminder } from './lib/notifications'
import './styles/app.css'

const ProgressPage = lazy(() => import('./pages/ProgressPage'))
const TrendsPage = lazy(() => import('./pages/TrendsPage'))

export default function App() {
  const initialize = useTrackerStore(s => s.initialize)
  const initialized = useTrackerStore(s => s.initialized)
  const hasCompletedSetup = useTrackerStore(s => s.hasCompletedSetup)
  const profile = useTrackerStore(s => s.profile)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!initialized || !hasCompletedSetup) return undefined
    return scheduleDailyReminder(profile)
  }, [initialized, hasCompletedSetup, profile])

  if (!initialized) {
    return <div className="loading-screen">Loading Wolf Tracker...</div>
  }

  return (
    <HashRouter>
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
            <Route path="/progress" element={<LazyRoute component={ProgressPage} />} />
            <Route path="/trends" element={<LazyRoute component={TrendsPage} />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </HashRouter>
  )
}
