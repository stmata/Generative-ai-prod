import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeContext } from "./context/ThemeContext";
import { AppProvider } from "./context/AppContext";
import { StatsProvider } from "./context/StatsContext";
import { UsersProvider } from "./context/UsersContext";
import { DARK_THEME } from "./constants/themeConstants";
import ProtectedRoutes from "./routes/ProtectedRoute";
import "./App.scss";
import Index from './components/Index/Index'
import Tabs from "./components/Tabs/Tabs";

function App() {
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    if (theme === DARK_THEME) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [theme]);

  return (
    <StatsProvider>
      <UsersProvider>

        <AppProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/127" element={<Tabs />} />
              <Route path="/*" element={<ProtectedRoutes />} />
            </Routes>
          </Router>
        </AppProvider>
      </UsersProvider>

    </StatsProvider>
  );
}

export default App;
