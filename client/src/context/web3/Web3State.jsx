import Web3Context from "./web3Context";
import { useState, useContext, useEffect } from "react";
import { providers, ethers } from 'ethers';
import { contractAddress, contractABI } from '../../constants/constants';

const Web3State = ({ children }) => {
    const [alert, setAlert] = useState(null);
    const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

    const showAlert = (type, message) => {
        setAlert({
            type: type,
            msg: message,
        });
        setTimeout(() => {
            setAlert(null);
        }, 5000);
    };

    const [state, setState] = useState({
        provider: null,
        signer: null,
        contract: null,
        address: null
    });

    const connectWallet = async () => {
        console.log("Connecting Wallet");
        if (window.ethereum) {
            setIsMetaMaskAvailable(true);
            try {
                const provider = new providers.Web3Provider(window.ethereum);
                console.log("metamask provider : ", provider);

                window.ethereum.on("chainChanged", () => {
                    window.location.reload();
                });

                window.ethereum.on("accountsChanged", () => {
                    window.location.reload();
                });

                const signer = provider.getSigner();
                console.log("signer : ", signer);
                const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
                const address = accounts[0];
                console.log("accounts : ", accounts);
                const contract = new ethers.Contract(contractAddress, contractABI, signer);
                console.log("contract : ", contract);
                setState({ provider, signer, contract, address });

            } catch (err) {
                console.error(err);
            }
        } else {
            console.error("Metamask not Detected");
            showAlert("danger", "Metamask not Detected, Please install it and then try again");
            setIsMetaMaskAvailable(false);
            return;
        }
    };

    const resetConnection = () => {
        console.log("Resetting Wallet Connection");
        setState({
            provider: null,
            signer: null,
            contract: null,
            address: null
        });
    };

    useEffect(() => {
        // Check if MetaMask is installed
        setIsMetaMaskAvailable(Boolean(window.ethereum));
    }, []);

    return (
        <Web3Context.Provider value={{
            state, connectWallet, resetConnection, alert, showAlert, isMetaMaskAvailable
        }}>
            {children}
        </Web3Context.Provider>
    );
}

export default Web3State;
