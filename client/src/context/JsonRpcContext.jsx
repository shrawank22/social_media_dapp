import { createContext, useContext, useState } from "react";
import { Transaction as EthTransaction} from "@ethereumjs/tx";
import { useWalletConnectClient } from "./ClientContext";
import { formatTestBatchCall, formatTestTransaction } from "../helpers/tx";
import { DEFAULT_EIP155_METHODS, DEFAULT_EIP155_OPTIONAL_METHODS } from "../constants/constants";
import { hashPersonalMessage, rpcProvidersByChainId, verifySignature } from "../helpers";


export const JsonRpcContext = createContext({});

export function JsonRpcContextProvider({ children }) {
    const [pending, setPending] = useState(false);
    const [result, setResult] = useState();
    const [lastTxId, setLastTxId] = useState();
    const { client, session, accounts, balances } = useWalletConnectClient();

    const _createJsonRpcRequestHandler = (rpcRequest) => async (chainId, address) => {
        let _a;
        console.log("rpcRequest : ", rpcRequest);
        if (typeof client === "undefined") {
            throw new Error("WalletConnect is not initialized");
        }
        if (typeof session === "undefined") {
            throw new Error("Session is not connected");
        }
        try {
            setPending(true);
            const result = await rpcRequest(chainId, address);
            setResult(result);
        }
        catch (err) {
            console.error("RPC request failed: ", err);
            setResult({
                address,
                valid: false,
                result: err?.message ?? err,
            });
        }
        finally {
            setPending(false);
        }
    }

    const ping = async () => {
        if (typeof client === "undefined") {
            throw new Error("WalletConnect is not initialized");
        }
        if (typeof session === "undefined") {
            throw new Error("Session is not connected");
        }

        try {
            setPending(true);
            let valid = false;
            try {
                await client.ping({ topic: session.topic });
                valid = true;
            }
            catch (e) {
                valid = false;
            }
            // display result
            setResult({
                method: "ping",
                valid,
                result: valid ? "Ping succeeded" : "Ping failed",
            });
        }
        catch (e) {
            console.error(e);
            setResult(null);
        }
        finally {
            setPending(false);
        }
    }



    const ethereumRpc = {
        testSendTransaction: _createJsonRpcRequestHandler(async (chainId, address) => {
            console.log("chainId: ", chainId, " address: ", address);
            const caipAccountAddress = `${chainId}:${address}`;
            console.log("accounts : ", accounts);
            const account = accounts.find((account) => account === caipAccountAddress);
            if (account === undefined)
                throw new Error(`Account for ${caipAccountAddress} not found`);
            const tx = await formatTestTransaction(account);

            console.log("tx: ", tx);

            const balance = BigInt(balances[account][0].balance || "0");
            if (balance < (BigInt(tx.gasPrice) * BigInt(tx.gasLimit))) {
                return {
                    method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
                    address,
                    valid: false,
                    result: "Insufficient funds for intrinsic transaction cost",
                };
            }

            console.log("session : ", session);

            const result = await client.request({
                topic: session.topic,
                chainId,
                request: {
                    method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
                    params: [tx],
                },
            });

            console.log("result: ", result);

            return {
                method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
                address,
                valid: true,
                result,
            };
        }),
        testSignTransaction: _createJsonRpcRequestHandler(async (chainId, address) => {
            const caipAccountAddress = `${chainId}:${address}`;
            const account = accounts.find((account) => account === caipAccountAddress);
            if (account === undefined)
                throw new Error(`Account for ${caipAccountAddress} not found`);
            const tx = await formatTestTransaction(account);
            const signedTx = await client.request({
                topic: session.topic,
                chainId,
                request: {
                    method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN_TRANSACTION,
                    params: [tx],
                },
            });
            const CELO_ALFAJORES_CHAIN_ID = 44787;
            const CELO_MAINNET_CHAIN_ID = 42220;
            let valid = false;
            const [, reference] = chainId.split(":");
            if (reference === CELO_ALFAJORES_CHAIN_ID.toString() ||
                reference === CELO_MAINNET_CHAIN_ID.toString()) {
                const [, signer] = recoverTransaction(signedTx);
                valid = signer.toLowerCase() === address.toLowerCase();
            } else {
                valid = EthTransaction.fromSerializedTx(signedTx).verifySignature();
            }
            return {
                method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN_TRANSACTION,
                address,
                valid,
                result: signedTx,
            };
        }),
        testSignPersonalMessage: _createJsonRpcRequestHandler(async (chainId, address) => {
            const message = `My email is john@doe.com - ${Date.now()}`;
            const hexMsg = encoding.utf8ToHex(message, true);
            const params = [hexMsg, address];
            const signature = await client.request({
                topic: session.topic,
                chainId,
                request: {
                    method: DEFAULT_EIP155_METHODS.PERSONAL_SIGN,
                    params,
                },
            });
            const [namespace, reference] = chainId.split(":");
            const rpc = rpcProvidersByChainId[Number(reference)];
            if (typeof rpc === "undefined") {
                throw new Error(`Missing rpcProvider definition for chainId: ${chainId}`);
            }
            const hashMsg = hashPersonalMessage(message);
            const valid = await verifySignature(address, signature, hashMsg, rpc.baseURL);
            return {
                method: DEFAULT_EIP155_METHODS.PERSONAL_SIGN,
                address,
                valid,
                result: signature,
            };
        }),
        testEthSign: _createJsonRpcRequestHandler(async (chainId, address) => {
            const message = `My email is john@doe.com - ${Date.now()}`;
            const hexMsg = encoding.utf8ToHex(message, true);
            const params = [address, hexMsg];
            const signature = await client.request({
                topic: session.topic,
                chainId,
                request: {
                    method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN,
                    params,
                },
            });
            const [namespace, reference] = chainId.split(":");
            const rpc = rpcProvidersByChainId[Number(reference)];
            if (typeof rpc === "undefined") {
                throw new Error(`Missing rpcProvider definition for chainId: ${chainId}`);
            }
            if (typeof rpc === "undefined") {
                throw new Error(`Missing rpcProvider definition for chainId: ${chainId}`);
            }
            const hashMsg = hashPersonalMessage(message);
            const valid = await verifySignature(address, signature, hashMsg, rpc.baseURL);

            return {
                method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN,
                address,
                valid,
                result: signature,
            };
        }),
        testWalletGetCapabilities: _createJsonRpcRequestHandler(async (chainId, address) => {
            const [namespace, reference] = chainId.split(":");
            const rpc = rpcProvidersByChainId[Number(reference)];
            if (typeof rpc === "undefined") {
                throw new Error(`Missing rpcProvider definition for chainId: ${chainId}`);
            }
            const capabilitiesJson = session?.sessionProperties?.["capabilities"];
            const walletCapabilities = capabilitiesJson && JSON.parse(capabilitiesJson);
            let capabilities = walletCapabilities[address];

            if (!capabilities)
                capabilities = await client.request({
                    topic: session.topic,
                    chainId,
                    request: {
                        method: DEFAULT_EIP5792_METHODS.WALLET_GET_CAPABILITIES,
                        params: [address],
                    },
                });
            
            return {
                method: DEFAULT_EIP5792_METHODS.WALLET_GET_CAPABILITIES,
                address,
                valid: true,
                result: JSON.stringify(capabilities),
            };
        }),
        testWalletGetCallsStatus: _createJsonRpcRequestHandler(async (chainId, address) => {
            const [namespace, reference] = chainId.split(":");
            const rpc = rpcProvidersByChainId[Number(reference)];
            if (typeof rpc === "undefined") {
                throw new Error(`Missing rpcProvider definition for chainId: ${chainId}`);
            }
            if (lastTxId === undefined)
                throw new Error(`Last transaction ID is undefined, make sure previous call to sendCalls returns successfully. `);
            const params = [lastTxId];
            // send request for wallet_getCallsStatus
            const getCallsStatusResult = await client.request({
                topic: session.topic,
                chainId,
                request: {
                    method: DEFAULT_EIP5792_METHODS.WALLET_GET_CALLS_STATUS,
                    params: params,
                },
            });
            return {
                method: DEFAULT_EIP5792_METHODS.WALLET_GET_CALLS_STATUS,
                address,
                valid: true,
                result: JSON.stringify(getCallsStatusResult),
            };
        }),
        testWalletSendCalls: _createJsonRpcRequestHandler(async (chainId, address) => {
            const caipAccountAddress = `${chainId}:${address}`;
            const account = accounts.find((account) => account === caipAccountAddress);
            if (account === undefined)
                throw new Error(`Account for ${caipAccountAddress} not found`);
            const balance = BigInt(balances[account][0].balance || "0");
            if (balance.lt(parseEther("0.0002"))) {
                return {
                    method: DEFAULT_EIP5792_METHODS.WALLET_SEND_CALLS,
                    address,
                    valid: false,
                    result: "Insufficient funds for batch call [minimum 0.0002ETH required excluding gas].",
                };
            }
            const [namespace, reference] = chainId.split(":");
            const rpc = rpcProvidersByChainId[Number(reference)];
            if (typeof rpc === "undefined") {
                throw new Error(`Missing rpcProvider definition for chainId: ${chainId}`);
            }
            const sendCallsRequestParams = await formatTestBatchCall(account);

            const txId = await client.request({
                topic: session.topic,
                chainId,
                request: {
                    method: DEFAULT_EIP5792_METHODS.WALLET_SEND_CALLS,
                    params: [sendCallsRequestParams],
                },
            });

            setLastTxId(txId && txId.startsWith("0x") ? txId : undefined);

            return {
                method: DEFAULT_EIP5792_METHODS.WALLET_SEND_CALLS,
                address,
                valid: true,
                result: txId,
            };
        }),
    };

    return (
        <JsonRpcContext.Provider value={{ ping, ethereumRpc, rpcResult: result, isRpcRequestPending: pending }}>
            {children}
        </JsonRpcContext.Provider>
    )
}

export function useJsonRpc() {
    const context = useContext(JsonRpcContext);
    if (context === undefined) {
        throw new Error("useJsonRpc must be used within a JsonRpcContextProvider");
    }
    return context;
}