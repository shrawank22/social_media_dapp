import React from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggleButton = () => {
  const { toggleTheme, theme } = useTheme();

  return (
    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'end'}}>
    <button onClick={toggleTheme} >
    <i className={`bi bi-toggle-${theme === "light" ? "off" : "on"} }`}></i>
       {theme === "light" ? "Dark" : "Light"} 
    </button>
    </div>
  );
};

export default ThemeToggleButton;
