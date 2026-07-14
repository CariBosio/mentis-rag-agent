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

    // 1. Si la respuesta HTTP no es exitosa (ej: 502, 504 o 404)
    if (!response.ok) {
      throw new Error(`Error de servidor (${response.status})`);
    }

    // 2. Leemos la respuesta primero como texto plano para verificar que no esté vacía
    const textData = await response.text();

    if (!textData || textData.trim() === "") {
      throw new Error("El backend devolvió una respuesta vacía.");
    }

    // 3. Si tiene contenido, recién ahí intentamos transformarlo en JSON de forma segura
    let data;
    try {
      data = JSON.parse(textData);
    } catch {
      console.warn(
        "La respuesta no era un JSON válido. Tratándola como texto plano.",
      );
      return textData;
    }

    // 4. Retornamos el output del JSON si existe
    return (
      data.output || data.response || "No se recibió respuesta del agente."
    );
  } catch (error) {
    console.error("⚠️ Error de comunicación backend controlado:", error);

    // Devolvemos un mensaje de error amigable, y dejamos que el flujo continúe sin trabar la interfaz
    return "Disculpame, en este momento no logré conectar de manera óptima con el servidor. Por favor, intentá reformular tu pregunta o realizala de nuevo en unos instantes.";
  }
};
