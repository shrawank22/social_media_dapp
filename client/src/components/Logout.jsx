import { useEffect } from "react";
import { logoutUser } from "../api/authApi";

function Logout() {
  useEffect(() => {
    async function handleLogout() {
      try {
        logoutUser();
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