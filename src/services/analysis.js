const baseUrl = import.meta.env.VITE_APP_BASE_URL

export async function analyzeSession(sessionId) {
  const response = await fetch(`${baseUrl}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!response.ok) {
    throw new Error("Analyse échouée");
  }
  return await response.json();
}
