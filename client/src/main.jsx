import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
// import { EthereumContextProvider } from './context/EthereumContext.jsx'
import Web3State from './context/web3/Web3State.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Web3State>
      <App />
    </Web3State>
  </React.StrictMode>
)
