import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchStats } from "../services/statsService";

const StatsContext = createContext();

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const data = await fetchStats();
      if (data) setStats(data);
      setLoading(false);
    };

    loadStats();
  }, []);

  const refreshStats = async () => {
    setLoading(true);
    const data = await fetchStats();
    if (data) setStats(data);
    setLoading(false);
  };

  return (
    <StatsContext.Provider value={{ stats, loading, refreshStats }}>
      {children}
    </StatsContext.Provider>
  );
};

export const useStats = () => useContext(StatsContext);
