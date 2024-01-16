import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { contractAddress, contractABI } from './constants/constants'
import Home from './components/Home'
import './App.css'

import Profile from './components/Profile'
import Notification from './components/Notification'
import Login from './components/Login'
import Register from './components/Register'
import Widgets from './components/Widgets'
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
    address: null
  });

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
    <Router>
      <Navbar />
      <div className='container'>
        <div className='row'>
          <div className='col-md-9 col-sm-12 scrollable-content'>
            <Routes>
              <Route exact path='/' element={<Home state={state} />} />
              <Route exact path='/profile' element={<Profile />} />
              <Route exact path='/login' element={<Login state={state}/>} />
              <Route exact path='/register' element={<Register state={state}/>} />
            </Routes>
          </div>
          <div className='col-md-3 col-sm-12 scrollable-sidebar'>
            <Widgets />
          </div>
        </div>
      </div>

    </Router>

  )
}

export default App

