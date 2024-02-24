import './App.css'
import { useEffect, useContext } from 'react'

import Home from './components/Home'
import Profile from './components/Profile'
import Login from './components/Login'
import Register from './components/Register'
import Widgets from './components/Widgets'
import Navbar from './components/Navbar'
import Alert from './components/Alert'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PostState from './context/post/postState'
import web3Context from './context/web3/web3Context'

function App() {
  const context = useContext(web3Context);
  const { connectWallet } = context;

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <PostState>
      <Router>
        <Navbar />
        <Alert />
        <div className='container'>
          <div className='row'>
            <div className='col-md-9 col-sm-12 scrollable-content'>
              <Routes>
                <Route exact path='/' element={<Home />} />
                <Route exact path='/profile' element={<Profile />} />
                <Route exact path='/login' element={<Login />} />
                <Route exact path='/register' element={<Register />} />
              </Routes>
            </div>
            <div className='col-md-3 col-sm-12 scrollable-sidebar'>
              <Widgets />
            </div>
          </div>
        </div>
      </Router>
    </PostState>
  )
}

export default App
