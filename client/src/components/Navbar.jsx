import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { EthereumContext } from '../context/EthereumContext';
import web3Context from '../context/web3/web3Context';

const Navbar = () => {
    const context = useContext(web3Context);
    const { state } = context;
    const { contract, address } = state;


    const [isOpen, setIsOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [showSearchItems, setShowSearchItems] = useState(false);
    const [searchResult, setSearchResult] = useState([]);


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

    const handleSearch = async () => {
        console.log("Search Query : ", searchText);
        
            try {
                console.log("contract : ", contract);
                console.log("address: ", address);
                const tx = await contract.getUsersByName(searchText);
                console.log("tx: ", tx);

                const promises = tx.map(async item => {
                    const followTx = await contract.isFollowing(item[0], address)
                    console.log("followTx : ", followTx);

                    return {
                        address : item[0],
                        imageUrl : item[1],
                        name: searchText,
                        isFollowing: followTx || false
                    };
                });

                console.log("promises : ", promises);
                const newSearchResult = await Promise.all(promises);
                console.log("newSearchResult : ", newSearchResult);
                setSearchResult(newSearchResult);
                setShowSearchItems(true);
            } catch (e) {
                console.log("Error searching user : ", e);
            }

        return;
    }

    const followUser = async (addr) => {
        console.log("addr : ", addr);
        console.log("address : ", address);
        try {
            const receipt = await contract.followUser(addr);
            await receipt.wait();
        } catch(e) {
            console.log("followUser error : ", e)
        }
    }

    const unFollowUser = async (addr) => {
        console.log("addr : ", addr);
        console.log("address : ", address);
        try {
            const tx = await contract.unfollowUser(addr)
            await tx.wait();
        } catch(e) {
            console.log("unFollowUser error : ", e)
        }
    }

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
                    {
                        <div className="max-w-md mx-auto mt-4">
                            <div className="mb-4 flex">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                                    placeholder="Search Users..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                                <button
                                    className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500"
                                    onClick={handleSearch}
                                >
                                    Search
                                </button>
                                <ul className="absolute top-[4.5rem] w-80 bg-white shadow-md rounded-md z-10">
                                    {showSearchItems && searchResult.map((user) => (
                                        <li
                                            key={user.address}
                                            className="flex items-center px-4 py-2 border-b last:border-none hover:bg-gray-100"
                                        >
                                            <img
                                                src={user.imageUrl}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full mr-4"
                                            />
                                            <span className="flex-grow">{user.name}</span>
                                            <button
                                                className={`ml-4 px-3 py-1 rounded-md shadow-sm focus:outline-none focus:ring ${user.isFollowing ? 'bg-red-700 text-white hover:bg-red-800' : 'bg-green-700 text-white hover:bg-green-800'
                                                    }`}
                                                onClick={() => {
                                                    user.isFollowing ? unFollowUser(user.address) : followUser(user.address);
                                                }}
                                            >
                                                {user.isFollowing ? 'Unfollow' : 'Follow'}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>


                        </div>

                    }
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
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Navbar
