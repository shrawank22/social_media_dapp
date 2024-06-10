import { useEffect } from "react";
import { logoutUser } from "../api/authApi";

function Logout() {
    useEffect(() => {
        async function handleLogout() {
          try {
            if(!localStorage.getItem('userDid'))
              return;
            const res = await logoutUser();
            if (res.status === 200) {
              localStorage.clear();
              window.location.href = "/";
            } else {
              console.error("Error logging out");
            }
          } catch (error) {
            console.error("Error logging out", error);
          }
        }
    
        handleLogout();
      }, []);
}

export default Logout;