export const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export const downloadChatsService = async (payload) => {
  try {
    if (!payload.ids && payload.id) {
      payload = { ids: [payload.id] };
    }
    const response = await fetch(`${API_BASE_URL}/download/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement des chats");
    }
    return await response.json();
  } catch (error) {
    console.error("downloadChatsService error:", error);
    throw error;
  }
};

export const downloadAnalysisService = async (payload) => {
  try {
    if (!payload.ids && payload.id) {
      payload = { ids: [payload.id], format: payload.format };
    }
    const response = await fetch(`${API_BASE_URL}/download/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement de l'analyse");
    }
    return await response.json();
  } catch (error) {
    console.error("downloadAnalysisService error:", error);
    throw error;
  }
};

export const downloadAllService = async (payload) => {
  try {
    if (!payload.ids && payload.id) {
      payload = { ids: [payload.id], format: payload.format };
    }
    const response = await fetch(`${API_BASE_URL}/download/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Erreur lors du téléchargement global");
    }
    return await response.json();
  } catch (error) {
    console.error("downloadAllService error:", error);
    throw error;
  }
};
