import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Web3State from './context/web3/Web3State.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
import { SessionProvider } from './context/SessionContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      {/* <SessionProvider> */}
        <Web3State>
          <App />
        </Web3State>
      {/* </SessionProvider> */}
    </ThemeProvider>
  </React.StrictMode>
)
