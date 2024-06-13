import * as encoding from "@walletconnect/encoding";
import { apiGetAccountNonce, apiGetGasPrice } from "./api";

export async function formatTestTransaction(account) {
    const [namespace, reference, address] = account.split(":");
    const chainId = `${namespace}:${reference}`;
    let _nonce;

    try {
        _nonce = await apiGetAccountNonce(address, chainId);
    } catch (error) {
        throw new Error(`Failed to fetch nonce for address ${address} on chain ${chainId}`);
    }

    const nonce = encoding.sanitizeHex(encoding.numberToHex(_nonce));
    const _gasPrice = await apiGetGasPrice(chainId);
    const gasPrice = encoding.sanitizeHex(_gasPrice);
    const _gasLimit = 21000;
    const gasLimit = encoding.sanitizeHex(encoding.numberToHex(_gasLimit));
    const _value = 10000000;
    const value = encoding.sanitizeHex(encoding.numberToHex(_value));
    console.log('value : ', value);
    const tx = {
        from: address,
        to: '0xD51B19Cd6E59C6831Df87175f73d43ac66dC2996',
        data: "0x",
        nonce,
        gasPrice,
        gasLimit,
        value,
    };

    return tx;
}

export async function formatTestBatchCall(account) {
    const [namespace, reference, address] = account.split(":");
    // preparing calldata for batch send
    //sepolia pow faucet address
    const receiverAddress = "0x6Cc9397c3B38739daCbfaA68EaD5F5D77Ba5F455";
    const amountToSend = parseEther("0.0001").toHexString();
    const calls = [
        {
            to: receiverAddress,
            data: "0x",
            value: amountToSend,
        },
        {
            to: receiverAddress,
            data: "0x",
            value: amountToSend,
        },
    ];
    const sendCallsRequestParams = {
        version: "1.0",
        chainId: `0x${BigInt(reference).toString(16)}`,
        from: address,
        calls: calls,
    };
    return sendCallsRequestParams;
}