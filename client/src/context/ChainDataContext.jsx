import { createContext, useContext, useEffect, useState } from "react";

export const ChainDataContext = createContext();

export function ChainDataContextProvider({ children}) {
    const [chainData, setChainData] = useState({});

    const loadChainData = async () => {
        const chainData = {
            "eip155": {
                "80002": {
                    "name": "Polygon Amoy",
                    "id": "eip155:80002",
                    "rpc": [
                        "https://rpc-amoy.polygon.technology"
                    ],
                    "slip44": 60,
                    "testnet": true
                }
            }
        };

        setChainData(chainData);
    }

    useEffect(() => {
        loadChainData();
    }, []);

    return (
        <ChainDataContext.Provider value={{chainData}}>
            {children}
        </ChainDataContext.Provider>
    );
}

export function useChainData() {
    const context = useContext(ChainDataContext);
    if (context == undefined) {
        throw new Error("useChainData must be used within a ChainDataContextProvider");
    }
    return context;
}