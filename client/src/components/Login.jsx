import { useState, useContext, useEffect } from "react"
import postContext from '../context/post/postContext';
import web3Context from '../context/web3/web3Context';
import { Center, Container } from "@chakra-ui/react";
import PolygonIDVerifier from "./PolygonIDVerifier";
import { useNavigate } from "react-router-dom";
import { useChainData } from "../context/ChainDataContext";
import { useJsonRpc } from "../context/JsonRpcContext";
import { useWalletConnectClient } from "../context/ClientContext";

const Login = () => {
    const context1 = useContext(postContext);
    const context2 = useContext(web3Context);
    const [connectId, setConnectId] = useState("");
    const { showAlert } = context1;
    const { state } = context2;

    const [provedAccess, setProvedAccess] = useState(false);
    const { client, session, connect, disconnect, chains, accounts, balances, isFetchingBalances, isInitializing, setChains, uri} = useWalletConnectClient();
    const { ping, ethereumRpc, isRpcRequestPending, rpcResult } = useJsonRpc();
    const { chainData } = useChainData();

    const navigate = useNavigate();

    useEffect(() => {
        if(typeof client !== "undefined") {
            connect();
        }
    }, [client]);

    useEffect(() => {
        if(provedAccess) {
            setTimeout(() => {
                navigate("/");
            }, 1500);
        }   
    }, [provedAccess]);

    useEffect(() => {
        setConnectId(uri);
    }, [uri]);

    const handleTransaction = async () => {
        console.log("session : ", session);
        console.log("addresses : ", accounts);
        try {
            const chainId = 'eip155:80002';
            const address = '0xf3c95b1a8cabf3d5151912377aeadd84aa41c27c';

            await ethereumRpc.testSendTransaction(chainId, address);
        } catch (error) {
            console.error('handleTransaction error : ', error);
        }
    }

    return (
        <>
            {!provedAccess &&
                <Center className="vc-check-page">
                    <Container>
                        <PolygonIDVerifier
                            publicServerURL={
                                import.meta.env.VITE_REACT_APP_VERIFICATION_SERVER_PUBLIC_URL
                              }
                              localServerURL={
                                import.meta.env.VITE_REACT_APP_VERIFICATION_SERVER_LOCAL_HOST_URL
                              }
                              credentialType={"userprofile"}
                              issuerOrHowToLink={
                                "https://oceans404.notion.site/How-to-get-a-Verifiable-Credential-f3d34e7c98ec4147b6b2fae79066c4f6?pvs=4"
                              }
                              onVerificationResult={setProvedAccess}
                              userAddress={state.address}
                              uri={connectId}
                        />
                    </Container>
                    {
                        <button type="button" onClick={handleTransaction} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:!my-0 my-2 text-center">send transaction</button>
                    }
                </Center>
            }

        </>
    )
}

export default Login
