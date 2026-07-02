// URL local típica de n8n para pruebas de Webhooks en desarrollo
// Cambiá la URL por la de producción fija:
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export const initializeRAGStore = async (): Promise<void> => {
  // Cumplimos con la carga inicial indicando que la base vectorial en Neon ya está lista en el backend
  console.log("🤖 Conector RAG: Ecosistema n8n + Neon inicializado.");
  return Promise.resolve();
};

/**
 * Conecta el frontend de React con el flujo RAG de n8n cumpliendo las bases del Challenge.
 */
export const searchRelevantContext = async (query: string): Promise<string> => {
  try {
const response = await fetch(N8N_WEBHOOK_URL, {
  method: "POST",
  mode: "cors", // Aseguramos que maneje explícitamente políticas de CORS
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ 
    chatInput: query,       
    sessionId: "user-session-cordoba" 
  }),
});

    if (!response.ok) {
      throw new Error("No se pudo conectar con el flujo de n8n.");
    }

    const data = await response.json();
    
    // n8n suele devolver la respuesta del modelo en 'output' o 'response'
    return data.output || data.response || "No se recibió respuesta del agente.";

  } catch (error) {
    console.error("Error de comunicación backend:", error);
    return "Disculpame, estoy teniendo un inconveniente para conectar con mi servidor. Por favor, intentá de nuevo en unos instantes.";
  }
};