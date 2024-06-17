import Web3Context from "./web3Context";
import { useState } from "react";
import { providers, ethers } from 'ethers'
import { contractAddress, contractABI } from '../../constants/constants'

const Web3State = ({ children }) => {
    const [state, setState] = useState({
        provider: null,
        signer: null,
        contract: null,
        address: null
    });

    const connectWallet = async () => {
        console.log("Connecting Wallet")
        console.log("window.ethereum : ", window.ethereum)
        if (window.ethereum) {
            try {
                const provider = new providers.Web3Provider(window.ethereum);
                console.log("metamask provider : ", provider);

                window.ethereum.on("chainChanged", () => {
                    window.location.reload();
                });

                window.ethereum.on("accountsChanged", () => {
                    window.location.reload();
                });
                
                const signer = await provider.getSigner();
                console.log("signer : ", signer);
                const address = await signer.getAddress();
                console.log("address : ", address);
                const contract = new ethers.Contract(contractAddress, contractABI, signer);
                console.log("contract : ", contract);
                setState({ provider, signer, contract, address })

            } catch (err) {
                console.error(err);
            }

        } else {
            console.error("Metamask not Detected");
        }
    };

    return (
        <Web3Context.Provider value={{ state, connectWallet }}>
            {children}
        </Web3Context.Provider>
    )

}
export default Web3State;