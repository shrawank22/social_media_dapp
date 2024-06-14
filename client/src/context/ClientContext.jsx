// import Client from "@walletconnect/sign-client";
import { Web3Modal } from "@web3modal/standalone";
import { RELAYER_EVENTS } from "@walletconnect/core";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { getAppMetadata, getSdkError } from "@walletconnect/utils";
import { apiGetAccountBalance } from "../helpers";
import { contractAddress, contractABI, DEFAULT_APP_METADATA } from "../constants/constants";
import { Contract, ethers } from "ethers";
// import UniversalProvider from "@walletconnect/universal-provider";
// import web3 from "web3";
import { EthereumProvider } from "@walletconnect/ethereum-provider";


export const ClientContext = createContext({});
const DEFAULT_RELAY_URL = import.meta.env.VITE_PUBLIC_RELAY_URL;

const web3Modal = new Web3Modal({
    projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID,
    themeMode: "light",
    walletConnectVersion: 2,
});

export function ClientContextProvider({ children }) {
    const [client, setClient] = useState();
    const [session, setSession] = useState();

    const [isFetchingBalances, setIsFetchingBalances] = useState(false);
    const [isInitializing, setIsInitializing] = useState(false);
    const prevRelayerValue = useRef("");

    const [balances, setBalances] = useState({});
    const [accounts, setAccounts] = useState([]);
    const [chains, setChains] = useState(['eip155:80002']);
    const [relayerRegion, setRelayerRegion] = useState(DEFAULT_RELAY_URL);
    const [origin, setOrigin] = useState(getAppMetadata().url);
    const [uri, setUri] = useState("");
    const [ethereumProvider, setEthereumProvider] = useState();
    const [web3Provider, setWeb3Provider] = useState();
    const [state, setState] = useState({
        signer: null,
        contract: null,
        address: null
    });

    const reset = () => {
        setSession(undefined);
        setBalances({});
        setAccounts([]);
        setChains([]);
        setRelayerRegion(DEFAULT_RELAY_URL);
    }

    const getAccountBalances = async _accounts => {
        setIsFetchingBalances(true);
        try {
            const arr = await Promise.all(
                _accounts.map(async account => {
                    const [namespace, reference, address] = account.split(":");
                    const chainId = `${namespace}:${reference}`;
                    const assets = await apiGetAccountBalance(address, chainId);

                    return { account, assets: [assets] };
                })
            )

            const balances = {}
            arr.forEach(({ account, assets }) => {
                balances[account] = assets;
            });

            setBalances(balances);
        } catch (e) {
            console.error(e);
        } finally {
            setIsFetchingBalances(false);
        }
    }

    const onSessionConnected = useCallback(async _session => {
        if (!ethereumProvider) {
            return;
        }
        const allNamespaceAccounts = Object.values(_session.namespaces)
            .map(namespace => namespace.accounts)
            .flat();
        // const allNamespaceChains = Object.keys(_session.namespaces);

        console.log("_session : ", _session);

        setSession(_session);
        setChains(['eip155:80002']);
        setAccounts(allNamespaceAccounts);
        createWeb3Provider(ethereumProvider);
        await getAccountBalances(allNamespaceAccounts);
    }, [ethereumProvider])

    const connect = useCallback(async pairing => {
        if (typeof client === "undefined") {
            throw new Error("WalletConnect is not initialized")
        }
        console.log("connect, pairing topic is:", pairing?.topic)

        try {
            const requiredNamespaces = {
                eip155: {
                    methods: [
                        "eth_sendTransaction",
                        "personal_sign"
                    ],
                    chains: [
                        "eip155:80002"
                    ],
                    events: [
                        "chainChanged",
                        "accountsChanged"
                    ],
                    rpcMap: {
                        80002:
                            `https://rpc.walletconnect.com?chainId=eip155:80002&projectId=${import.meta.env.VITE_PUBLIC_PROJECT_ID}`
                    }
                }
            };
            console.log(
                "requiredNamespaces config for connect:",
                requiredNamespaces
            )
            const optionalNamespaces = {
                eip155: {
                    methods: [
                        "eth_signTransaction",
                        "eth_sign",
                        "eth_signTypedData",
                        "eth_signTypedData_v4"
                    ],
                    chains: [
                        "eip155:80002"
                    ],
                    events: [],
                    rpcMap: {
                        80002:
                            `https://rpc.walletconnect.com/v1?chainId=eip155:80002&projectId=${import.meta.env.VITE_PUBLIC_PROJECT_ID}`
                    }
                }
            };
            console.log(
                "optionalNamespaces config for connect:",
                optionalNamespaces
            )

            const res = await ethereumProvider.connect({
                chains: [80002],
                optionalChains: [80002],
                rpcMap: {
                    '80002': import.meta.env.VITE_RPC_URL
                },
            })

            console.log("res : ", res);

            // setUri(uri);

            // console.log("inside connect\nuri:", uri);

            const lastKeyIndex = client.session.keys.length - 1
            const _session = client.session.get(client.session.keys[lastKeyIndex])
            console.log("Established session:", _session)

            console.log("client : ", client);

            createWeb3Provider(ethereumProvider);

            await onSessionConnected(_session);
        } catch (e) {
            console.error(e);
            throw e;
        } finally {
            // close modal in case it was open
            web3Modal.closeModal();
        }
    }, [chains, client, onSessionConnected]);

    const createWeb3Provider = useCallback(async (ethprovider) => {
        const hexChainId = ethers.utils.hexValue(80002);
        let ethersProvider = new ethers.providers.Web3Provider(ethprovider);
        console.log("ethersProvider : ", ethersProvider);
        let signer = await ethersProvider.getSigner();
        console.log("signer : ", signer);
        ethersProvider.send("wallet_switchEthereumChain", [
            { chainId: hexChainId },
        ]);
        let network = await ethersProvider.getNetwork();
        console.log("network : ", network);
        // console.log("Inside createWeb3Provider");
        // console.log("ethereumProvider : ", walletProvider);
        // const web3Provider = new BrowserProvider(walletProvider);
        // console.log("web3Provider : ", web3Provider);
        // setWeb3Provider(web3Provider);
        // const signer = await web3Provider.getSigner();
        // console.log('signer : ', signer);
        // const contract = new Contract(contractAddress, contractABI, signer);
        // console.log('contract : ', contract);
        // const address = await contract.signer.getAddress();
        // console.log('getAddress() : ', address);
        // setState({ signer, contract, address: '' });

        // const tx = await contract.addPost(
        //     String('ipfsHash_Contract_Testing'),
        //     parseInt('10')
        //   );
        // console.log('tx : ', tx);
        // const receipt = await tx.wait();
        // console.log('receipt : ', receipt);
    }, []);

    const disconnect = useCallback(async () => {
        if (typeof client === "undefined") {
            throw new Error("WalletConnect is not initialized")
        }
        if (typeof session === "undefined") {
            throw new Error("No session to disconnect")
        }

        await client.disconnect({
            topic: session.topic,
            reason: getSdkError("USER_DISCONNECTED")
        });

        reset();
    }, [client, session]);

    const _subscribeToEvents = useCallback(
        async _client => {
            if (typeof _client === "undefined") {
                throw new Error("WalletConnect is not initialized")
            }

            _client.on("session_ping", args => {
                console.log("EVENT", "session_ping", args)
            })

            _client.on("session_event", args => {
                console.log("EVENT", "session_event", args)
            })

            _client.on("session_update", ({ topic, params }) => {
                console.log("EVENT", "session_update", { topic, params })
                const { namespaces } = params
                const _session = _client.session.get(topic)
                const updatedSession = { ..._session, namespaces }
                onSessionConnected(updatedSession)
            })

            _client.on("session_delete", () => {
                console.log("EVENT", "session_delete")
                reset()
            })
        },
        [onSessionConnected]
    );

    const _checkPersistedState = useCallback(
        async _client => {
            if (typeof _client === "undefined") {
                throw new Error("WalletConnect is not initialized")
            }

            if (typeof session !== "undefined") return
            // populates (the last) existing session to state
            if (_client.session?.length) {
                const lastKeyIndex = _client.session.keys.length - 1
                const _session = _client.session.get(_client.session.keys[lastKeyIndex])
                console.log("RESTORED SESSION:", _session)
                await onSessionConnected(_session)
                return _session
            }
        },
        [session, onSessionConnected]
    );

    const _logClientId = useCallback(async _client => {
        if (typeof _client === "undefined") {
            throw new Error("WalletConnect is not initialized")
        }
        try {
            const clientId = await _client?.core?.crypto?.getClientId()
            console.log("WalletConnect ClientID: ", clientId)
            localStorage.setItem("WALLETCONNECT_CLIENT_ID", clientId)
        } catch (error) {
            console.error(
                "Failed to set WalletConnect clientId in localStorage: ",
                error
            )
        }
    }, []);

    const createClient = useCallback(async () => {
        try {
            setIsInitializing(true);
            const claimedOrigin = localStorage.getItem("wallet_connect_dapp_origin") || origin;

            // const provider = await EthereumProvider.init({
            //     name: 'WalletConnect provider',
            //     projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID,
            //     logger: "debug",
            //     metadata: {
            //         ...(DEFAULT_APP_METADATA),
            //         name: 'WalletConnect Social Media',
            //         url: claimedOrigin,
            //         description: "WalletConnect Social Media",
            //         icons: ['https://avatars.githubusercontent.com/u/37784886']
            //     },
            //     relayUrl: relayerRegion,
            //     // relayUrl: relayerRegion,
            //     // rpcProviders: ['eip:155']
            //     // ogger: "debug",
            //     // relayUrl: relayerRegion,
            //     // projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID,
            //     // metadata: {
            //     //     ...(DEFAULT_APP_METADATA),
            //     //     url: claimedOrigin,
            //     //     verifyUrl: DEFAULT_APP_METADATA.verifyUrl,
            //     //     description: "WalletConnect Social Media",
            //     // },
            // })
            const provider = await EthereumProvider.init({
                projectId: import.meta.env.VITE_PUBLIC_PROJECT_ID,
                metadata: {
                    // ...(DEFAULT_APP_METADATA),
                    name: 'Social_Media',
                    url: claimedOrigin,
                    description: "WalletConnect Social Media",
                    icons: ['https://avatars.githubusercontent.com/u/37784886']
                },
                chains: [80002],
                showQrModal: false,
                optionalChains: [80002],
                rpcMap: {
                    80002: import.meta.env.VITE_RPC_URL
                }
            })

            provider.connect

            console.log("provider : ", provider);

            setEthereumProvider(provider);
            setClient(provider);
            // await createWeb3Provider(provider);
            // setOrigin(provider.client.metadata.url);
            // prevRelayerValue.current = relayerRegion;
            await _subscribeToEvents(provider);
            await _checkPersistedState(provider);
            await _logClientId(provider);
        } catch (e) {
            throw e;
        } finally {
            setIsInitializing(false);
        }
    }, [
        _checkPersistedState,
        _logClientId,
        _subscribeToEvents,
        origin,
        relayerRegion
    ]);

    useEffect(() => {
        localStorage.getItem("wallet_connect_dapp_origin") || origin;
    }, [origin]);

    useEffect(() => {

        if (!client) {
            createClient();
        } else if (
            prevRelayerValue.current && prevRelayerValue.current !== relayerRegion
        ) {
            // client.core.relayer.restartTransport(relayerRegion);
            prevRelayerValue.current = relayerRegion;
        }
    }, [client, createClient, relayerRegion]);

    useEffect(() => {
        if (!client) return;

        // client.core.relayer.on(RELAYER_EVENTS.connect, () => {
        //     console.log("Wallet connection is restored");
        // });

        // client.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
        //     console.log("Wallet connection is lost");
        // });
    }, [client]);

    const value = useMemo(() => ({
        isInitializing,
        balances,
        isFetchingBalances,
        accounts,
        chains,
        relayerRegion,
        client,
        session,
        connect,
        disconnect,
        setChains,
        setRelayerRegion,
        origin,
        uri
    }),
        [
            isInitializing, balances, isFetchingBalances, accounts, chains, relayerRegion, client, session, connect, disconnect, setChains, setRelayerRegion, origin, uri
        ]);

    return (
        <ClientContext.Provider value={{ ...value }}>
            {children}
        </ClientContext.Provider>
    )
}

export function useWalletConnectClient() {
    const context = useContext(ClientContext);
    if (context === undefined) {
        throw new Error("useWalletConnectClient must be used within a ClientContextProvider");
    }
    return context;
}

