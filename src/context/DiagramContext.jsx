import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchDiagrams } from "../services/statsService";

const DiagramContext = createContext();

export const DiagramProvider = ({ children }) => {
  const [diagramData, setDiagramData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDiagrams = async () => {
    setLoading(true);
    const data = await fetchDiagrams();
    if (data) setDiagramData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDiagrams();
  }, []);

  const refreshDiagrams = async () => {
    await loadDiagrams();
  };

  return (
    <DiagramContext.Provider value={{ diagramData, loading, refreshDiagrams }}>
      {children}
    </DiagramContext.Provider>
  );
};

export const useDiagrams = () => useContext(DiagramContext);
