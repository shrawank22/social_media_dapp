import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Web3State from './context/web3/Web3State.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
import { WalletProvider } from './context/walletContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WalletProvider>
      <Web3State>
        <App />
      </Web3State>
    </WalletProvider>
  </React.StrictMode>
)
