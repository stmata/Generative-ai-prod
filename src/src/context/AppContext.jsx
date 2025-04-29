import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
   const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication status

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
