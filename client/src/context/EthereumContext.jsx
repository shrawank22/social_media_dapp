import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Web3 } from "web3";
import { contractABI, contractAddress } from "../constants/constants";
import { useCallback } from "react";

export const EthereumContext = createContext({});

export function EthereumContextProvider({ children }) {
    const [provider, setProvider] = useState(null);
    const [web3, setWeb3] = useState(null);
    const [uri, setUri] = useState('');
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [address, setAddress] = useState(null);
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

    const getBalance = async (web3, address) => {
        console.log("Inside getBalance");
        console.log("web3 : ", web3);
        console.log("address : ", address);

        // sanity check
        if(!address) {
            console.log("address not initialized");
            return;
        }
        if(!web3) {
            console.log("web3 provider not initialized");
            return;
        }

        // get address balance
        let balance = await web3.eth.getBalance(address);
        setBalance(balance);

        console.log("balance : ", balance);
    }

    const reset = () => {
        setBalance({});
        setAddress('');
        setWeb3();
        setContract();
        setState({
            provider: null,
            contract: null,
            address: null
        });

        provider.on("disconnect", () => {
            console.log("[EVENT]", " disconnect ");
            reset();
        }); 
    }

    // const _checkPersistedState = useCallback(async () => {
    //     if(typeof provider === "undefined") {
    //         console.log("Inside _checkPersistedState\nprovider not defined");
    //         return;
    //     }
    //     if(typeof contract === "undefined") {
    //         console.log("Inside _checkPersistedState\ncontract not defined");
    //         return;
    //     }
    // });

    // const _subscribeToEvents = useCallback( async _provider => {
    //     if(typeof _provider === "undefined") {
    //         console.log("Inside _subscribeToEvents\nprovider not defined");
    //         return;
    //     }

    //     _provider.on("connect", args => {
    //         console.log("[EVENT]", " connect ", args);
    //     });

    //     _provider.on("session_event", args => {
    //         console.log("[EVENT]", " session_event ", args);
    //     });

    //     _provider.on("disconnect", () => {
    //         console.log("[EVENT]", " disconnect ");
    //         reset();
    //     });
    // });

    // const disconnectWallet = useCallback(async () => {
    //     if(typeof provider === "undefined") {
    //         console.log("Inside disconnectWallet\nprovider not defined");
    //         return;
    //     }
        
    //     reset();
    // }, [provider]);

    const createEthereumProvider = async () => {
        console.log("Inside createEthereumProvider");
        console.log("provider : ", provider);
        
        // if provider already exists, return
        if(provider){
            console.log("provider exists");
            return;
        }

        const ethProvider = await EthereumProvider.init({
            projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID,
            metadata: {
                name: 'SocialX',
                description: 'A Social Media Platform on Polygon Network',
                url: 'http://localhost:5173',
                icons: ['https://i.ibb.co/M8S8RXt/logo-removebg-preview.png']
            },
            showQrModal: false,
            optionalChains: [80002],
            rpcMap: {
                80002: 'https://rpc-amoy.polygon.technology'
            },
            disableProviderPing: false
        });
        setProvider(ethProvider);
        console.log("ethProvider : ", ethProvider);
        window.provider = ethProvider;
        // ethProvider.modal
        
        
    };

    if(provider) {
        console.log("provider : ", provider);
    }

    const createWeb3Provider = async () => {

        console.log("Inside createWeb3Provider");
        console.log("provider : ", provider);

        if(!provider) {
            console.log("provider not initialized");
            return;
        }

        let web3 = await new Web3(provider);
        setWeb3(web3);

        return web3;
    }

    if(web3) {
        console.log("web3 : ", web3);
    }

    const getAccount = async (web3Provider) => {
        console.log("Inside getAccount");
        console.log("web3 : ", web3);
        console.log("web3Provider : ", web3Provider);

        if(!web3Provider && !web3) {
            console.log("web3 not initialized");
            return;
        }

        let accounts = await web3Provider.eth.getAccounts();
        console.log("accounts : ", accounts);
        setAddress(accounts[0]);
        return accounts[0];
    }

    if(address) {
        console.log("address : ", address);
    }
    

    const connectWallet = async () => {
        console.log("Inside connectWallet");
        console.log("provider : ", provider);

        if(!provider) {
            console.log("provider not initialized");
            return;
        }

        console.log("checkpoint 0");

        // Set URI to connect with wallet
        provider.on("display_uri", handleUri);
        await provider.enable();

        console.log("checkpoint 1");

        // Initialize web3
        const web3Provider = await createWeb3Provider();
        console.log("web3 : ", web3);
        console.log("web3Provider : ", web3Provider);
        console.log("checkpoint 2");

        // Fetch Account details
        const accAddress = await getAccount(web3Provider);
        console.log("account : ", accAddress);
        console.log("checkpoint 3");

        await createContract(web3Provider, provider, accAddress);
        console.log("checkpoint 4");
    };

    const createContract = async (web3, provider, address) => {
        console.log("Inside createContract");
        console.log("web3 : ", web3);
        console.log("provider : ", provider);
        console.log("address : ", address);
        console.log("contractAddress : ", contractAddress);

        if(!web3) {
            console.log("web3 provider not initialized");
            return;
        }
        let contract = new web3.eth.Contract(contractABI, contractAddress);
        window.contract = contract;
        setContract(contract);
        console.log("contract : ", contract);
        console.log("provider : ", provider);
        console.log("address : ", address);
        setState({ provider, contract, address });

        console.log("contract : ", contract);
    }

    if(contract) {
        console.log("contract : ", contract);
    }
    if(state) {
        console.log("state : ", state);
    }

    useEffect(() => {
        createEthereumProvider();
    }, []);

    // const value = useMemo(() => ({
    //     provider,
    //     web3,
    //     uri,
    //     address,
    //     connectWallet,
    //     createContract,
    //     // disconnectWallet,
    //     balance,
    //     state,
    //     reset
        
    // }), [provider, web3, uri, address, connectWallet, createContract, balance, state, reset]);

    return (
        <EthereumContext.Provider value={{ provider, web3, uri, address, connectWallet, createContract, balance, state, reset }}>
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