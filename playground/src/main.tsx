import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@owdproject/react-kit-react95/styles.css'
import '../../src/theme.css'
import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('#root not found')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
