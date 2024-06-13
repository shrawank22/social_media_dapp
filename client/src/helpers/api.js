import axios from "axios";

const WALLETCONNECT_RPC_BASE_URL = `https://rpc.walletconnect.com/v1?projectId=${import.meta.env.VITE_PUBLIC_PROJECT_ID}`

export const rpcProvidersByChainId = {
    80002: {
        name: "Polygon Amoy",
        baseURL: WALLETCONNECT_RPC_BASE_URL + "&chainId=eip155:80002",
        token: {
            name: "Matic",
            symbol: "MATIC"
        }
    }
}

const api = axios.create({
    baseURL: "https://rpc.walletconnect.com/v1",
    timeout: 10000, // 10 secs
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
    }
})

export async function apiGetAccountBalance(address, chainId) {
    const [namespace, networkId] = chainId.split(":");

    if(namespace !== "eip155") {
        return { balance: "", symbol: "", name: "" }
    }

    const ethChainId = chainId.split(":")[1]
    const rpc = rpcProvidersByChainId[Number(ethChainId)]
    if (!rpc) {
        return { balance: "", symbol: "", name: "" }
    }

    const { baseURL, token } = rpc
    const response = await api.post(baseURL, {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1
    });

    const { result } = response.data;
    const balance = parseInt(result, 16).toString();
    return { balance, ...token };
}

export const apiGetAccountNonce = async (address, chainId) => {
    const ethChainId = chainId.split(":")[1]
    const { baseURL } = rpcProvidersByChainId[Number(ethChainId)]
    const response = await api.post(baseURL, {
        jsonrpc: "2.0",
        method: "eth_getTransactionCount",
        params: [address, "latest"],
        id: 1
    })
    const { result } = response.data
    const nonce = parseInt(result, 16)
    return nonce
}

export const apiGetGasPrice = async chainId => {
    const ethChainId = chainId.split(":")[1]
    const { baseURL } = rpcProvidersByChainId[Number(ethChainId)]
    const response = await api.post(baseURL, {
      jsonrpc: "2.0",
      method: "eth_gasPrice",
      params: [],
      id: 1
    })
    const { result } = response.data
    return result
}
  