import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './hooks/useCart'
import { ToastProvider } from './components/ui/Toast'
import { I18nProvider } from './i18n'
import LenisProvider from './components/ui/LenisProvider'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import App from './App'

gsap.registerPlugin(ScrollTrigger)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <CartProvider>
          <ToastProvider>
            <LenisProvider>
              <App />
            </LenisProvider>
          </ToastProvider>
        </CartProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
)
