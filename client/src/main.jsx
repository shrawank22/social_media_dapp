import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { EthereumContextProvider } from './context/EthereumContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <EthereumContextProvider>
      <App />
    </EthereumContextProvider>
  </React.StrictMode>
)
