import { useState, useContext, useEffect } from "react"
import postContext from '../context/post/postContext';
import web3Context from '../context/web3/web3Context';
import { Center, Container } from "@chakra-ui/react";
import PolygonIDVerifier from "./PolygonIDVerifier";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const context1 = useContext(postContext);
    const context2 = useContext(web3Context);
    const { showAlert } = context1;
    const { state } = context2;

    const [provedAccess, setProvedAccess] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if(provedAccess) {
            setTimeout(() => {
                navigate("/");
            }, 1500);
        }   
    })

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
                        />
                    </Container>
                </Center>
            }

        </>
    )
}

export default Login
