import React, { useContext, useEffect } from "react"; 
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeContext } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";
import { DARK_THEME, LIGHT_THEME } from "./constants/themeConstants";
// import MoonIcon from "./assets/icons/moon.svg";
// import SunIcon from "./assets/icons/sun.svg";
import ProtectedRoutes from "./routes/ProtectedRoute";
import "./App.scss";
import Chatboot from './components/Chatboot/Chatboot'
function App() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  useEffect(() => {
    if (theme === DARK_THEME) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [theme]);

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Chatboot />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>

        {/* <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
      >
        <img
          className="theme-icon"
          src={theme === LIGHT_THEME ? SunIcon : MoonIcon}
          alt="theme icon"
        />
      </button> */}
      </Router>
    </AppProvider>
  );
}

export default App;
