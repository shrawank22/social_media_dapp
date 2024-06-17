import './App.css'
import { useEffect } from 'react'

import Home from './components/Home'
import Profile from './components/Profile'
import Login from './components/Login'
import Register from './components/Register'
import Notification from './components/Notification'
import Navbar from './components/Navbar'
import Alert from './components/Alert'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PostState from './context/post/postState'
import Connection from './components/Connection'
import Logout from './components/Logout'
import { useEthereumConnectClient } from './context/EthereumContext'

function App() {
  const { connectWallet, provider } = useEthereumConnectClient();

  useEffect(() => {
    if(localStorage.getItem('jwz-token') && provider) {
      connectWallet();
    }
  }, [provider]);

  return (
    <PostState>
      <Router>
        <Navbar />
        <Alert />
        <div className='container'>
          <div className='row mb-10'>
              <Routes>
                <Route exact path='/' element={<Home />} />
                <Route exact path='/profile' element={<Profile />} />
                <Route exact path='/login' element={<Login />} />
                <Route exact path='/connection' element={<Connection />} />
                <Route exact path='/register' element={<Register />} />
                <Route exact path='/notifications' element={<Notification />} />
                <Route exact path='/logout' element={<Logout />} />
                <Route path='*'>404 Not Found</Route>
              </Routes>
            </div>
          </div>
      </Router>
    </PostState>
  )
}

export default App
