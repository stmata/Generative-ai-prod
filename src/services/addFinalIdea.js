const baseUrl = import.meta.env.VITE_APP_BASE_URL

export const addFinalIdea = async (idea) => {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
        throw new Error("No session id found.");
    }

    const response = await fetch(`${baseUrl}/add-finalIdea?session_id=${sessionId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ idea }),
    });

    if (!response.ok) {
        throw new Error("Error sending final idea");
    }

    const result = await response.json();
    return result;
};
