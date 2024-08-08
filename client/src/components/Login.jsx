import { useState, useContext, useEffect } from "react"
import web3Context from '../context/web3/web3Context';
import { Center, Container } from "@chakra-ui/react";
import PolygonIDVerifier from "./PolygonIDVerifier";
import { useNavigate } from "react-router-dom";
// import { EthereumContext, useEthereumConnectClient } from "../context/EthereumContext";

const Login = () => {
    const context = useContext(web3Context);
    
    const { state } = context;

    // const [connectId, setConnectId] = useState("");
    const [provedAccess, setProvedAccess] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if(provedAccess) {
            setTimeout(() => {
                navigate("/");
            }, 1500);
        }   
    }, [provedAccess]);

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
                            //   uri={connectId}
                        />
                    </Container>
                </Center>
            }
        </>
    )
}

export default Login
