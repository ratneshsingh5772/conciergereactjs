import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import { setupInterceptors } from './services/api'
import { logout, refreshToken } from './features/auth/authSlice'
import './index.css'
import App from './App.tsx'

setupInterceptors(store, { logout, refreshTokenFulfilled: refreshToken });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
