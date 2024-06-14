import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Web3 } from "web3";
import { contractABI, contractAddress } from "../constants/constants";

export const EthereumContext = createContext({});

export function EthereumContextProvider({ children }) {
    const [provider, setProvider] = useState();
    const [web3, setWeb3] = useState();
    const [uri, setUri] = useState('');
    const [account, setAccount] = useState('');


    const handleUri = async (uri) => {
        console.log("Inside handleUri");
        console.log("uri : ", uri);
        setUri(uri);
        console.log("Exiting handleUri");
    }

    const createEthereumProvider = async () => {
        console.log("Inside createEthereumProvider")
        const provider = await EthereumProvider.init({
            projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID,
            metadata: {
                name: 'My Website',
                description: 'My website description',
                url: 'http://localhost:5173',
                icons: ['https://avatars.githubusercontent.com/u/37784886']
            },
            showQrModal: false,
            optionalChains: [80002],
            rpcMap: {
                80002: 'https://rpc-amoy.polygon.technology'
            }
        });
        console.log("provider : ", provider);
        setProvider(provider);
        console.log("Exiting createEthereumProvider")
    }

    const connectWallet = async () => {
        console.log("Inside connectWallet")
        provider.on("display_uri", handleUri);
        
        await provider.enable();

        let web3 = new Web3(provider);
        console.log("web3 : ", web3);
        setWeb3(web3);

        let accounts = await web3.eth.getAccounts(); 
        console.log("accounts : ", accounts);
        setAccount(accounts[0]);

        console.log("Exiting connectWallet");
    }

    const contract = async () => {
        console.log("Inside contract");
        if(web3) {
            let contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("contract : ", contract);
            window.contract = contract;
        } else {
            console.log("web3 not initialized");
        }
        console.log("Exiting contract");
    }

    useEffect(() => {
        createEthereumProvider();
    }, []);

    useEffect(() => {
        if(web3) {
            contract();
        }
    }, [web3]);

    const value = useMemo(() => ({
        provider,
        web3,
        uri,
        account,
        connectWallet,
        contract
    }), [provider, web3, uri, account, connectWallet, contract]);

    return (
        <EthereumContext.Provider value={{ ...value }}>
            {children}
        </EthereumContext.Provider>
    );
}

export function useEthereumConnectClient() {
    const context = useContext(EthereumContext);
    if (context === undefined) {
        throw new Error('useEthereumConnectClient must be used within a EthereumContextProvider');
    }
    return context;
}