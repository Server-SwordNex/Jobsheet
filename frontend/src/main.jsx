import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './colors.css'
import './publicTheme.css'
import './index.css'
import App from './App.jsx'

// The app routes with the "#" (HashRouter). Someone who types or bookmarks a plain address such as
// /superadmin/login is sent to the same page in that form (/#/superadmin/login).
if (window.location.protocol !== 'file:' && window.location.pathname !== '/' && !window.location.hash) {
  window.location.replace(`/#${window.location.pathname}${window.location.search}`)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
