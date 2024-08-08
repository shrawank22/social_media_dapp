import { useEffect } from "react";
import { logoutUser } from "../api/authApi";
// import { useEthereumConnectClient } from "../context/EthereumContext";
import web3Context from "../context/web3/web3Context";

function Logout() {
  const context = useContext(web3Context);
  // const { reset } = useEthereumConnectClient();
  const { resetConnection } = context;

  useEffect(() => {
    async function handleLogout() {
      try {
        logoutUser();
        resetConnection();
        indexedDB.deleteDatabase("WALLET_CONNECT_V2_INDEXED_DB");
        localStorage.clear();
        window.location.href = "/";
      } catch (error) {
        console.error("Error logging out", error);
      }
    }

    handleLogout();
  }, []);
}

export default Logout;