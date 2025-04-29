export const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const fetchStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) {
      throw new Error("Erreur lors du chargement des statistiques");
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur API :", error);
    return null;
  }
};

export const fetchDiagrams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/diagrams`);
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des données des graphiques");
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
};

export const fetchAnalysisData = async (startDate, endDate) => {
    try {
        let url = `${API_BASE_URL}/analysis`;
        if (startDate && endDate) {
            url += `?start_date=${startDate}&end_date=${endDate}`;
        }
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("Error fetching analysis data:", error);
        return [];
    }
};

export const deleteAnalysisEntry = async (sessionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/analysis/${sessionId}`, {
            method: "DELETE"
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting analysis entry:", error);
        return { deleted: false };
    }
};

export const fetchUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/datas`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching user data:", error);
        return [];
    }
};

export const fetchUser = async (idSession) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user?id_session=${idSession}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching user data:", error);
      return [];
    }
};
  