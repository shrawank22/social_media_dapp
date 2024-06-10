import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react';
import { createContext, useEffect } from 'react';

const PROJECT_ID = '2d4760d5cba1f88770f23f4a51dfa7a7';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const polygonAmoy = {
        chainId: 80002,
        name: 'Polygon Amoy',
        currency: 'MATIC',
        explorerUrl: 'https://amoy.polygonscan.com/',
        rpcUrl: 'https://rpc-amoy.polygon.technology',
    }
    
    const metadata = {
        name: 'Amoy Wallet',
        description: 'Amoy Wallet is a simple wallet that allows you to connect to the Polygon Amoy network.',
        url: 'http://localhost:5173',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
    }
    
    const ethersConfig = defaultConfig({
        metadata,
        enableEIP6963: true,
        enableInjected: true,
    });
    
    useEffect(() => {
        console.log("inside useEffect 0");
        createWeb3Modal({
            ethersConfig,
            chains: [polygonAmoy],
            projectId: PROJECT_ID,
            enableAnalytics: false,
        });
    },[]);

    return (
        <WalletContext.Provider value={{}}>
            {children}
        </WalletContext.Provider>
    );
}

export const useWallet = () => useContext(WalletContext);