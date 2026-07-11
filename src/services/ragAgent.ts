const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export const initializeRAGStore = async (): Promise<void> => {
  console.log("🤖 Conector RAG: Ecosistema n8n + Neon inicializado.");
  return Promise.resolve();
};

/* Conecta el frontend de React con el flujo RAG de n8n */
export const searchRelevantContext = async (query: string): Promise<string> => {
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatInput: query,
        sessionId: "user-session-cordoba",
      }),
    });

    if (!response.ok) {
      throw new Error("No se pudo conectar con el flujo de n8n.");
    }

    const data = await response.json();

    return (
      data.output || data.response || "No se recibió respuesta del agente."
    );
  } catch (error) {
    console.error("Error de comunicación backend:", error);
    return "Disculpame, estoy teniendo un inconveniente para conectar con mi servidor. Por favor, intentá de nuevo en unos instantes.";
  }
};
