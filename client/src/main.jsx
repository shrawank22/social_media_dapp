import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Web3State from './context/web3/Web3State.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
    <Web3State>
      <App />
    </Web3State>
    </ThemeProvider>
  </React.StrictMode>
)
