import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Web3 } from "web3";
import { contractABI, contractAddress } from "../constants/constants";
import { useCallback } from "react";

export const EthereumContext = createContext({});

export function EthereumContextProvider({ children }) {
    const [provider, setProvider] = useState();
    const [web3, setWeb3] = useState();
    const [uri, setUri] = useState('');
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState();
    const [address, setAddress] = useState();
    const [balance, setBalance] = useState({});
    const [state, setState] = useState({
        provider: provider,
        contract: contract,
        address: address
    });

    const handleUri = async (uri) => {
        console.log("uri : ", uri);
        setUri(uri);
    }

    const reset = () => {
        setBalance({});
        setAddress('');
    }

    const _checkPersistedState = useCallback(async () => {
        if(typeof provider === "undefined") {
            console.log("Inside _checkPersistedState\nprovider not defined");
            return;
        }
        if(typeof contract === "undefined") {
            console.log("Inside _checkPersistedState\ncontract not defined");
            return;
        }
    });

    const _subscribeToEvents = useCallback( async _provider => {
        if(typeof _provider === "undefined") {
            console.log("Inside _subscribeToEvents\nprovider not defined");
            return;
        }

        _provider.on("connect", args => {
            console.log("[EVENT]", " connect ", args);
        });

        _provider.on("session_event", args => {
            console.log("[EVENT]", " session_event ", args);
        });

        _provider.on("disconnect", () => {
            console.log("[EVENT]", " disconnect ");
            reset();
        });
    });

    const disconnectWallet = useCallback(async () => {
        if(typeof provider === "undefined") {
            console.log("Inside disconnectWallet\nprovider not defined");
            return;
        }
        
        reset();
    }, [provider]);

    const createEthereumProvider = useCallback(async () => {
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
            },
            disableProviderPing: false
        });
        console.log("provider : ", provider);
        window.provider = provider;
        provider.modal
        setProvider(provider);
    }, [_subscribeToEvents]);

    const getBalance = async () => {
        if(!address) {
            console.log("address not initialized");
            return;
        }
        if(web3) {
            let balance = await web3.eth.getBalance(address);
            console.log("balance : ", balance);
            setBalance(balance);
        } else {
            console.log("web3 provider not initialized");
        }
    }

    const connectWallet = useCallback(async () => {
        if(!provider)
            return;
        provider.on("display_uri", handleUri);
        await provider.enable();

        let web3 = new Web3(provider);
        setWeb3(web3);

        let accounts = await web3.eth.getAccounts();
        setAddress(accounts[0]);
    }, [provider]);

    const createContract = async () => {
        if(web3) {
            let contract = new web3.eth.Contract(contractABI, contractAddress);
            window.contract = contract;
            setContract(contract);
            
            setState({ provider, contract, address });
        } else {
            console.log("web3 provider not initialized");
        }
    }

    useEffect(() => {
        createEthereumProvider();
    }, []);

    useEffect(() => {
        if(web3) {
            createContract();
            getBalance();
        }
    }, [web3]);

    const value = useMemo(() => ({
        provider,
        web3,
        uri,
        address,
        connectWallet,
        createContract,
        disconnectWallet,
        balance,
        state
    }), [provider, web3, uri, address, connectWallet, createContract, disconnectWallet, balance, state]);

    return (
        <EthereumContext.Provider value={{ state, ...value }}>
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