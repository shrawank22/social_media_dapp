import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { EthereumContext } from '../context/EthereumContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { web3, reset, connectWallet } = useContext(EthereumContext);

    let location = useLocation();
    let navigate = useNavigate();
    const token = localStorage.getItem("jwz-token");
    const isAuthenticated = !!token;

    const handleLogout = () => {
        localStorage.removeItem("userDid");
        navigate('/login');
    };

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    console.log("web3 : ", web3)

    return (
        <>
            <nav className="bg-dark border-gray-200">
                <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto px-4">
                    <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">SocialX</span>
                    </Link>
                    <button type="button" onClick={toggleNavbar} className="inline-flex items-center my-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>
                    <div className={`w-full md:block md:w-auto ${isOpen ? '' : 'hidden'}`} id="navbar-default">
                        <ul className="font-medium flex flex-col my-3 md:p-0 bg-dark md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white-700">
                            <li>
                                <Link to="/" className={`block py-2 px-3 rounded md:bg-transparent md:p-0 hover:text-blue-700 ${location.pathname === "/" ? "text-blue-400" : "text-white"}`}>Home</Link>
                            </li>
                            <li>
                                <Link to="/about" className={`block py-2 px-3 rounded md:bg-transparent md:p-0 hover:text-blue-700 ${location.pathname === "/about" ? "text-blue-400" : "text-white"}`}>About</Link>
                            </li>
                            {isAuthenticated ?
                                <>
                                    <li>
                                        <Link to="/notifications" className={`block py-2 px-3 rounded md:bg-transparent md:p-0 hover:text-blue-700 ${location.pathname === "/notifications" ? "text-blue-400" : "text-white"}`}>Notifications</Link>
                                    </li>
                                    <li>
                                        <Link to="/profile" className={`block py-2 px-3 rounded md:bg-transparent md:p-0 hover:text-blue-700 ${location.pathname === "/profile" ? "text-blue-400" : "text-white"}`}>Profile</Link>
                                    </li>
                                    <li>
                                        <Link to="/logout" className={`block py-2 px-3 rounded md:bg-transparent md:p-0 hover:text-blue-700 ${location.pathname === "/logout" ? "text-blue-400" : "text-white"}`} onClick={handleLogout}>Logout</Link>
                                    </li>
                                </>
                                :
                                <>
                                    {
                                        location.pathname !== "/login" &&
                                        <li>
                                            <Link to="/login">
                                                <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:!my-0 my-2 text-center">Login</button>
                                            </Link>
                                        </li>
                                    }
                                    {
                                        (location.pathname !== "/register") && (location.pathname !== "/connection") &&

                                        <li>
                                            <Link to="/connection">
                                                <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 md:!my-0 my-2 text-center">Register</button>
                                            </Link>
                                        </li>
                                    }
                                </>
                            }
                            { (localStorage.getItem("userDid") || localStorage.getItem("jwz-token")) &&
                                <li>
                                    <button onClick={web3 ? reset : connectWallet} type="button" className={`text-white ${web3 ? 'bg-red-700' : 'bg-green-700'} ${web3 ? 'hover:bg-red-800' : 'hover:bg-green-800'} focus:ring-4 focus:outline-none ${web3 ? 'focus:ring-red-300' : 'focus:ring-green-300'}  font-medium rounded-lg text-sm px-4 py-2 md:!my-0 my-2 text-center`}>
                                        {
                                            web3 ? "Disconnect Wallet" : "Connect Wallet"
                                        }
                                    </button>
                                </li>
                            }
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar
