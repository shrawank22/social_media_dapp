import { useEffect } from "react";
import { logoutUser } from "../api/authApi";
import { useEthereumConnectClient } from "../context/EthereumContext";

function Logout() {
  const { reset } = useEthereumConnectClient();

  useEffect(() => {
    async function handleLogout() {
      try {
        logoutUser();
        reset();
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