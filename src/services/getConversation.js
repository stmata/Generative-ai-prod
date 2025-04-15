const baseUrl = import.meta.env.VITE_APP_BASE_URL

export const getConversation = async () => {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId) {
        throw new Error("No session id found.");
    }

    const response = await fetch(`${baseUrl}/conversation?session_id=${sessionId}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("Error fetching conversation history");
    }

    const data = await response.json();
    return {
        conversation_history: data.conversation_history,
        message_value: data.message_value,
    };
};

