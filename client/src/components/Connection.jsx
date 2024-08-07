import { useNavigate } from "react-router-dom";
import { QRCode } from "./QRCode";
import { useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import {Loader} from "./Loader";
import { EthereumContext } from "../context/EthereumContext";

function Connection() {
    const context1 = useContext(EthereumContext);
    const { uri, provider, connectWallet, reset, setProvider } = context1;

    const [sessionId, setSessionId] = useState("");
    const [qrCodeData, setQrCodeData] = useState("");
    const [isHandlingConnection, setIsHandlingConnection] = useState(false);
    const [connectionCheckComplete, setConnectionCheckComplete] = useState(false);
    const [connectionMessage, setConnectionMessage] = useState("⌛ Waiting for Connection...");
    const [socketEvents, setSocketEvents] = useState([]);

    const navigate = useNavigate();
    const serverUrl = window.location.href.startsWith("https") ? import.meta.env.VITE_REACT_APP_VERIFICATION_SERVER_PUBLIC_URL : import.meta.env.VITE_REACT_APP_VERIFICATION_SERVER_LOCAL_HOST_URL;
    console.log("serverUrl : ", serverUrl);
    const socket = io(serverUrl);
    const getQrCodeApi = (sessionId) => serverUrl + `/api/connection?sessionId=${sessionId}`;

    useEffect(() => {
        if (localStorage.getItem('userDid')) {
            navigate("/register");
        }
    });

    useEffect(() => {
        if(provider) {
            connectWallet();
        }
    }, [provider])

    useEffect(() => {
        console.log("useEffect 1");
        socket.on('connect', () => {
            setSessionId(socket.id);
            console.log("socket connection id : ", socket.id);
            socket.on(socket.id, (arg) => {
                setSocketEvents((socketEvents) => [...socketEvents, arg]);
            });
        });
    }, []);

    useEffect(() => {
        console.log("useEffect 2");
        const fetchQrCode = async () => {
            const response = await fetch(getQrCodeApi(sessionId));
            const data = await response.text();
            console.log("connection qrcode data : ", data);
            let res = {
                ssi: data,
                uri: uri
            }

            console.log("new data : ", res);

            return res;
        };

        console.log("sessionId : ", sessionId);

        if (sessionId) {
            fetchQrCode().then(setQrCodeData).catch(console.error);
        }
    }, [sessionId,  uri]);

    console.log("qrCodeData : ", qrCodeData);

    useEffect(() => {
        console.log("useEffect 3");
        if (socketEvents.length) {
            const currentSocketEvent = socketEvents[socketEvents.length - 1];

            if (currentSocketEvent.fn === "handleConnectionCallback") {
                if (currentSocketEvent.status === "IN_PROGRESS") {
                    console.log("in_progress")
                    setIsHandlingConnection(true);
                    setConnectionMessage("🔄 Establishing connection...")
                } else {
                    setIsHandlingConnection(false);
                    setConnectionCheckComplete(true);
                    if (currentSocketEvent.status === "DONE") {
                        console.log("connection done");
                        console.log("user did: ", currentSocketEvent.data);
                        localStorage.setItem('userDid', currentSocketEvent.data);
                        setConnectionMessage("✅ Connection established");
                        setTimeout(() => {
                            reportConnectionResult(true);
                        }, "2000");
                        socket.close();
                    } else {
                        console.log("connection error");
                        setConnectionMessage("❌ Error establishing connection");
                    }
                }
            }
        }
    }, [socketEvents]);

    const reportConnectionResult = (result) => {
        navigate("/register");
    }

    const handleReset = () => {
        console.log("handleReset");
        reset();
        indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB");
        connectWallet();
    }

    return (
        <section className="bg-gray-50 min-h-[93vh] py-10 flex items-center justify-center">
            <div className="w-full min-h-[72vh] max-w-md p-6 bg-white rounded-lg shadow">
                {qrCodeData ? (
                    <>
                        <h2 className="mb-4 text-2xl text-center font-bold text-gray-900">
                            Connect Mobile Wallet
                        </h2>
                        <h4 className="mb-6 text-sm text-center font-medium text-gray-600">
                            Scan the QR Code using your Mobile Wallet to establish a connection
                        </h4>
                        <div className="flex justify-center items-center mb-4">
                            <QRCode invitationUrl={JSON.stringify(qrCodeData)} size={200} />
                        </div>
                        <p className="text-center text-gray-500">
                            {connectionMessage}
                        </p>
                        <p onClick={handleReset} className="text-center text-gray-500 my-5 font-bold text-sm cursor-pointer">
                            Reset Wallet Connection
                        </p>
                    </>
                ) : (
                    <div className="flex justify-center text-center h-[72vh]">
                        <Loader size={20} color="gray-600" />
                    </div>
                )}
            </div>
        </section>
    )
}

export default Connection;
