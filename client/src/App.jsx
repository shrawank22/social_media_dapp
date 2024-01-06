import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { contractAddress, contractABI } from './constants/constants'
import Home from './components/Home'
import Explore from './components/Explore'
import Sidebar from './components/Sidebar'
import Profile from './components/Profile'
import Notification from './components/Notification'
import Widgets from './components/Widgets'
import './App.css'

function App() {
    const [state, setState] = useState({
        provider: null,
        signer: null,
        contract: null,
        address: null
    });

    const [selectedComponent, setSelectedComponent] = useState("Home");

    const handleOptionClick = (option) => {
        setSelectedComponent(option);
    };

    const renderSelectedComponent = () => {
        switch (selectedComponent) {
            case "Home":
                return <Home state={state}/>;
            case "Explore":
                return <Explore />;
            case "Notifications":
                return <Notification />;
            case "Profile":
                return <Profile />;

            default:
                return null;
        }
    };

    useEffect(() => {
        const connectWallet = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);

                    window.ethereum.on("chainChanged", () => {
                        window.location.reload();
                    });

                    window.ethereum.on("accountsChanged", () => {
                        window.location.reload();
                    });

                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();

                    const contract = new ethers.Contract(contractAddress, contractABI, signer);
                    setState({ provider, signer, contract, address })

                } catch (err) {
                    console.error(err);
                }

            } else {
                console.error("Metamask not Detected");
            }
        };
        connectWallet();
    }, []);

    // console.log(state);

    return (
        <>
            <div className="app">
                <Sidebar onOptionClick={handleOptionClick} />
                <div className='app-content'>
                    {renderSelectedComponent()}
                </div>
                <Widgets />
            </div>

        </>

    )
}

export default App
