import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/StreamAnimation.css'
import './i18n/config' // Initialize i18n
import App from './App.tsx'

console.log('main.tsx is loading...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Suspense fallback={<div>Loading...</div>}>
        <App />
      </Suspense>
    </StrictMode>,
  )
} else {
  console.error('Root element not found!');
}
