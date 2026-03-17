import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ensureAuthRestoredFromBackup, persistAuthBackup } from './utils/adminAuth'

// Restore app auth from backup if something (e.g. Supabase token refresh) cleared isSignedIn/currentUser
ensureAuthRestoredFromBackup()

// Persist auth to backup right before tab/browser closes so it survives close+reopen
if (typeof window !== 'undefined') {
  const saveAuthBeforeClose = () => { persistAuthBackup(); };
  window.addEventListener('beforeunload', saveAuthBeforeClose);
  window.addEventListener('pagehide', saveAuthBeforeClose);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)


