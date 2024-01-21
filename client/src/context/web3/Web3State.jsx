import Web3Context from "./web3Context";
import { useState } from "react";
import axios from 'axios'

const Web3State = ({ children }) => {
    const host = "http://localhost:8080"


    const [alert, setAlert] = useState(null);

    function showAlert(type, message) {
        setAlert({
            type: type,
            msg: message
        });
        setTimeout(() => {
            setAlert(null);
        }, 1500);
    };

    return (
        <Web3Context.Provider value={{ alert, showAlert }}>
            {children}
        </Web3Context.Provider>
    )

}
export default Web3State;