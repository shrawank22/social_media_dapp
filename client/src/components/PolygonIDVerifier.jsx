import {
    Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { QRCode } from "./QRCode";
import { io } from "socket.io-client";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Loader } from "./Loader";


const linkDownloadPolygonIDWalletApp =
    "https://0xpolygonid.github.io/tutorials/wallet/wallet-overview/#quick-start";

function PolygonIDVerifier({
    credentialType,
    issuerOrHowToLink,
    onVerificationResult,
    publicServerURL,
    localServerURL,
    userAddress,
    uri
}) {
    const [sessionId, setSessionId] = useState("");
    const [qrCodeData, setQrCodeData] = useState();
    const [isHandlingVerification, setIsHandlingVerification] = useState(false);
    const [verificationCheckComplete, setVerificationCheckComplete] =
        useState(false);
    const [verificationMessage, setVerificationMessage] = useState("⌛ Waiting for Proof...");
    const [socketEvents, setSocketEvents] = useState([]);

    const serverUrl = window.location.href.startsWith("https")
        ? publicServerURL
        : localServerURL;

    const getQrCodeApi = (sessionId) =>
        serverUrl + `/api/login?sessionId=${sessionId}&userAddress=${userAddress}`;

    const socket = io(serverUrl);

    useEffect(() => {
        console.log("inside useEffect");
        console.log("serverUrl : ", serverUrl);
        console.log("publicServerURL : ", publicServerURL);
        console.log("localServerURL : ", localServerURL);
        socket.on("connect", () => {
            setSessionId(socket.id);

            // only watch this session's events
            socket.on(socket.id, (arg) => {
                setSocketEvents((socketEvents) => [...socketEvents, arg]);
            });
        });
    }, []);

    useEffect(() => {
        const fetchQrCode = async () => {
            // if(!uri){
            //     return;
            // }
            const response = await fetch(getQrCodeApi(sessionId));
            let data = await response.text();
            console.log("data : ", data);
            let res = {
                ssi: data,
                uri: uri,
            }
            console.log("new data : ", res);
            return res;
        };

        if (sessionId) {
            fetchQrCode().then(setQrCodeData).catch(console.error);
        }
    }, [sessionId, uri]);

    // socket event side effects
    useEffect(() => {
        if (socketEvents.length) {
            const currentSocketEvent = socketEvents[socketEvents.length - 1];

            if (currentSocketEvent.fn === "handleVerification") {
                if (currentSocketEvent.status === "IN_PROGRESS") {
                    setIsHandlingVerification(true);
                    setVerificationMessage("🔍 Verifying proof...");
                } else {
                    setIsHandlingVerification(false);
                    setVerificationCheckComplete(true);
                    if (currentSocketEvent.status === "DONE") {
                        localStorage.setItem('userDid', currentSocketEvent.data.userDid);
                        localStorage.setItem('jwz-token', currentSocketEvent.data.jwzToken);
                        localStorage.setItem('profile', JSON.stringify(currentSocketEvent.data.profile));
                        setVerificationMessage("✅ Verified proof");
                        console.log("data : ", currentSocketEvent.data);
                        setTimeout(() => {
                            reportVerificationResult(true);
                        }, "2000");
                        socket.close();
                    } else {
                        setVerificationMessage("❌ Error verifying VC");
                    }
                }
            }
        }
    }, [socketEvents]);

    // callback, send verification result back to app
    const reportVerificationResult = (result) => {
        onVerificationResult(result);
    };

    function openInNewTab(url) {
        var win = window.open(url, "_blank");
        win.focus();
    }

    return (
        <div>
            <section className="bg-gray-50 min-h-[93vh] py-10 flex items-center justify-center">
                <div className="w-full min-h-[72vh] max-w-md p-6 bg-white rounded-lg shadow">
                    {qrCodeData ? (
                        <>
                            <h2 className="mb-4 text-2xl text-center font-bold text-gray-900">
                                Login
                            </h2>
                            <h4 className="mb-6 text-sm text-center font-medium text-gray-600">
                                Scan the QR Code using your Mobile Wallet to prove access
                            </h4>
                            <div className="flex justify-center items-center mb-4">
                                <QRCode invitationUrl={JSON.stringify(qrCodeData)} size={200} />
                            </div>
                            <p className="text-center text-sm text-gray-500">
                                {verificationMessage}
                            </p>

                            <p className="text-center mt-10 text-gray-500">
                                <Button
                                    fontSize={"10px"}
                                    margin={1}
                                    colorScheme="purple"
                                    onClick={() => openInNewTab(linkDownloadPolygonIDWalletApp)}
                                >
                                Download Wallet App{" "}
                                <ExternalLinkIcon marginLeft={2} />
                                </Button>
                            </p>
                        </>
                    ) : (
                        <div className="flex justify-center text-center h-[72vh]">
                            <Loader size={20} color="gray-600" />
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default PolygonIDVerifier;