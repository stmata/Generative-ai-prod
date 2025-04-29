import { extractContent } from "../context/extractContent";
const baseUrl = import.meta.env.VITE_APP_BASE_URL

export const sendMessageToAI = async (message, onStream, history = []) => {
  const sessionId = localStorage.getItem("session_id") || "";

  const response = await fetch(`${baseUrl}/chat_stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": sessionId,
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error("Erreur de réponse du serveur");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let done = false;
  let fullText = "";

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    if (value) {
      const chunk = decoder.decode(value);
      fullText += chunk;
      const { answer, sources } = extractContent(fullText);

      if (onStream) {
        onStream(chunk, answer, sources);
      }
    }
  }

  try {
    const parsed = JSON.parse(fullText);
    return [
      parsed.answer?.replace(/\\n/g, "\n") ?? "",
      parsed.sources?.replace(/\\n/g, "\n") ?? "",
    ];
  } catch (err) {
    console.error("Erreur de parsing final :", err);
    const { answer, sources } = extractContent(fullText);
    return [answer, sources];
  }
};
