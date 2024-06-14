import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Web3State from './context/web3/Web3State.jsx'
import { ChainDataContextProvider } from './context/ChainDataContext.jsx'
import { ClientContextProvider } from './context/ClientContext.jsx'
import { JsonRpcContextProvider } from './context/JsonRpcContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChainDataContextProvider>
      {/* <ClientContextProvider> */}
        <JsonRpcContextProvider>
          {/* <Web3State> */}
            <App />
          {/* </Web3State> */}
        </JsonRpcContextProvider>
      {/* </ClientContextProvider> */}
    </ChainDataContextProvider>
  </React.StrictMode>
)
