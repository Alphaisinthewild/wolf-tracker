import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import CrashBoundary, { installCrashLogging } from './components/CrashBoundary'
import './index.css'

installCrashLogging()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CrashBoundary>
      <App />
    </CrashBoundary>
  </React.StrictMode>,
)
