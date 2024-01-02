import './App.css';
import { useState, useEffect } from 'react'
import {Web3} from 'web3'
import SocialMediaContract from './blockchain/SocialMediaContract'
import Sidebar from './Sidebar'
import Widgets from './Widgets'
import HomeComponent from './HomeComponent';
import ExploreComponent from './ExploreComponent';
import NotificationsComponent from './NotificationsComponent';
import ProfileComponent from './ProfileComponent';


const App = () => {
  const [, setWeb3] = useState(null)
  const [address, setAddress] = useState(null)
  const [socialContract, setSocialContract] = useState(null)
  const [selectedComponent, setSelectedComponent] = useState("Home");

  const handleOptionClick = (option) => {
    setSelectedComponent(option);
  };

  const renderSelectedComponent = () => {
    switch (selectedComponent) {
      case "Home":
        return <HomeComponent />;
      case "Explore":
        return <ExploreComponent />;
      case "Notifications":
        return <NotificationsComponent />;
      // case "Messages":
      //   return <MessagesComponent />;
      // case "Bookmarks":
      //   return <BookmarksComponent />;
      // case "Lists":
      //   return <ListsComponent />;
      case "Profile":
        return <ProfileComponent />;
      // case "More":
      //   return <MoreComponent />;
      default:
        return null;
    }
  };

  useEffect(() => {
    // connectWalletHandler();
    if (socialContract) {
      console.log(socialContract);
    }
    if (socialContract && address) {
      console.log(address)
    }
  }, [socialContract, address]);

  const connectWalletHandler = async () => {
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" })
      
        const web3 = new Web3(window.ethereum)
       
        setWeb3(web3)
        
        const accounts = await web3.eth.getAccounts()
        
        setAddress(accounts[0])
        
        const contract1 = SocialMediaContract(web3)
        setSocialContract(contract1)
      } catch(err) {
        // setError(err.message);
      }
    } else {
      console.log("Please install MetaMask")
      // setError("Please install metamask wallet")
    }
  }

  return (
    <div>
      {
        address === '' ? (
          <button className='text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out' onClick={connectWalletHandler}>
            Connect Wallet
          </button>
        ) : (
          <div className="app">
            <Sidebar onOptionClick={handleOptionClick} />
            <div className='app-content'>
              {renderSelectedComponent()}
            </div>
            <Widgets />
          </div>
        )
      }
    </div>
  );
}

export default App;
