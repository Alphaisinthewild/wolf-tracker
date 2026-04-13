import React from 'react'

const ERROR_STORAGE_KEY = 'wolf-tracker-last-crash'

function formatError(error) {
  if (!error) return 'Unknown error'
  if (error instanceof Error) return `${error.name}: ${error.message}`
  if (typeof error === 'string') return error

  try {
    return JSON.stringify(error, null, 2)
  } catch {
    return String(error)
  }
}

function persistCrash(payload) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify({
      timestamp: new Date().toISOString(),
      ...payload,
    }))
  } catch {
    // ignore storage failures
  }
}

export function installCrashLogging() {
  if (typeof window === 'undefined') return
  if (window.__wolfTrackerCrashLoggingInstalled) return

  window.__wolfTrackerCrashLoggingInstalled = true

  window.addEventListener('error', (event) => {
    persistCrash({
      source: 'window.error',
      message: formatError(event.error || event.message),
      stack: event.error?.stack || '',
    })
  })

  window.addEventListener('unhandledrejection', (event) => {
    persistCrash({
      source: 'window.unhandledrejection',
      message: formatError(event.reason),
      stack: event.reason?.stack || '',
    })
  })
}

export function getLastCrash() {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(ERROR_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

class CrashBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, crash: null }
  }

  static getDerivedStateFromError(error) {
    return {
      error,
      crash: {
        source: 'react.error-boundary',
        message: formatError(error),
        stack: error?.stack || '',
      },
    }
  }

  componentDidCatch(error, info) {
    persistCrash({
      source: 'react.error-boundary',
      message: formatError(error),
      stack: error?.stack || '',
      componentStack: info?.componentStack || '',
    })
  }

  render() {
    if (this.state.error) {
      const crash = this.state.crash || {}

      return (
        <div className="crash-screen">
          <div className="crash-card">
            <span className="eyebrow">Wolf Tracker crash details</span>
            <h1>Something broke</h1>
            <p>The app caught an error instead of dropping to a blank screen.</p>
            <pre>{crash.message || 'Unknown error'}</pre>
            {crash.stack ? <pre>{crash.stack}</pre> : null}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default CrashBoundary
