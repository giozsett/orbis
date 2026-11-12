import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tema.css'
import './styles/animations.css'
import { iniciarTema } from './utils/tema'
import App from './App.jsx'

iniciarTema()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
