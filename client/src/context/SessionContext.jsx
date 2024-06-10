import { createContext, useState, useEffect } from "react";
import { io } from "socket.io-client";

const SessionContext = createContext();

const SessionProvider = ({ children }) => {
    const [sessionId, setSessionId] = useState(null);

    useEffect(() => {
        const serverUrl = window.location.href.startsWith("https") ? import.meta.env.VITE_REACT_APP_VERIFICATION_SERVER_PUBLIC_URL : import.meta.env.VITE_REACT_APP_VERIFICATION_SERVER_LOCAL_HOST_URL;
        const socket = io(serverUrl);
        socket.on('connect', () => {
            setSessionId(socket.id);
            console.log("socket connection id : ", socket.id);
        });


    }, []);

    return (
        <SessionContext.Provider value={{ sessionId }}>
            {children}
        </SessionContext.Provider>
    );
};

export { SessionProvider, SessionContext };