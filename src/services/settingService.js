export const API_BASE_URL = window._env_?.VITE_APP_BASE_URL || import.meta.env.VITE_APP_BASE_URL;

const settingService = {
    getSettings: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/config`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch settings.");
            }

            return await response.json();
        } catch (error) {
            console.error("Error:", error);
            return null;
        }
    },

    saveSettings: async (configData) => {
        try {
            console.log(configData)
            const response = await fetch(`${API_BASE_URL}/config`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(configData),
            });

            if (!response.ok) {
                throw new Error("Failed to save settings.");
            }

            return { success: true };
        } catch (error) {
            console.error("Error:", error);
            return { success: false };
        }
    },
};

export default settingService;
