import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { StoreProviderComponent } from './store.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProviderComponent>
    <App />
    </StoreProviderComponent>
  </StrictMode>,
)
