import { useEffect, useState, useRef } from "react";
import { initializeRAGStore, searchRelevantContext } from "./services/ragAgent";
import { gsap } from "gsap";
import ReactMarkdown from "react-markdown";
import Lenis from "lenis";
import "./App.css";
import MentisImagotipo from "./components/MentisImagotipo";
import mentisLogo from "/Imagotipo_Mentis_vectorize.svg";
import mentisAvatar from "/Avatar.png";

interface Message {
  sender: "paciente" | "menti";
  text: string;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "chat">(
    "welcome",
  );
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentTyping, setAgentTyping] = useState(false);

  // Referencias para elementos del DOM
  const welcomeRef = useRef<HTMLDivElement>(null);
  const chatLayoutRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Referencias para los contenedores del logo (Origen y Destino)
  const welcomeLogoRef = useRef<HTMLDivElement>(null);
  const sidebarLogoRef = useRef<HTMLImageElement>(null); // Cambiado a HTMLImageElement

  // Inicialización global de Lenis (Smooth Scroll)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  // Inicialización del RAG Store
  useEffect(() => {
    initializeRAGStore().then(() => {
      setLoading(false);
      setMessages([
        {
          sender: "menti",
          text: "¡Hola! Soy Menti, tu asistente simulado. ¿Qué duda tenés sobre el consultorio de la Lic. Carina Bosio?",
        },
      ]);
    });
  }, []);

  // Auto-scroll del chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      const lastBubble = document.querySelector(".message-wrapper:last-child");
      if (lastBubble) {
        gsap.fromTo(
          lastBubble,
          { opacity: 0, y: 15, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.2)" },
        );
      }
    }
  }, [messages, agentTyping]);

  // Foco del Input
  useEffect(() => {
    if (!agentTyping && currentScreen === "chat" && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
    }
  }, [agentTyping, currentScreen]);

  // 🎬 COREOGRAFÍA FLUIDA CON TU IDEA (Ocupando el espacio desde el inicio)
  useEffect(() => {
    if (!loading) {
      // 1. Configuramos el estado inicial de los elementos
      gsap.set(chatLayoutRef.current, { opacity: 0, y: 20 });
      gsap.set(sidebarLogoRef.current, { opacity: 0 }); // La imagen fija arranca oculta pero ocupa espacio

      const mainTimeline = gsap.timeline();

      // Animamos la entrada inicial del logo en el Lobby
      mainTimeline.fromTo(
        welcomeLogoRef.current,
        { opacity: 0, scale: 0.85, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power4.out" },
      );

      // 2. Tiempo de espera (3 segundos) para disfrutar la animación SVG
      mainTimeline.to({}, { duration: 6.0 });

      // 3. 🚀 Vuelo dinámico usando la posición real de la imagen oculta
      mainTimeline.to(
        {},
        {
          duration: 0,
          onComplete: () => {
            if (!welcomeLogoRef.current || !sidebarLogoRef.current) return;

            // Medimos el logo en el centro y la imagen estática oculta en la barra lateral
            const first = welcomeLogoRef.current.getBoundingClientRect();
            const last = sidebarLogoRef.current.getBoundingClientRect();

            // Calculamos las distancias métricas perfectas en X e Y
            const xDelta = last.left - first.left + 0.5;
            const yDelta = last.top - first.top - 19.5;

            // Calculamos la escala basada en el ancho real de destino
            const scaleDelta = last.width / first.width;

            const flightTl = gsap.timeline({
              onComplete: () => {
                setCurrentScreen("chat");
              },
            });

            // 1. El Lobby de fondo se desvanece
            flightTl.to(
              welcomeRef.current,
              {
                opacity: 0,
                duration: 0.8,
                ease: "power2.inOut",
              },
              "viaje",
            );

            // 2. El Dashboard aparece de fondo
            flightTl.to(
              chatLayoutRef.current,
              {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: "power3.out",
              },
              "viaje",
            );

            // 3. El logo viaja al 100% de opacidad y SE QUEDA CLAVADO en su posición final
            flightTl.to(
              welcomeLogoRef.current,
              {
                x: xDelta,
                y: yDelta,
                scale: scaleDelta,
                transformOrigin: "top left",
                duration: 1.1,
                ease: "power3.inOut",
              },
              "viaje",
            );

            // 4. 🎯 Esperamos que el logo se asiente por completo y quede 100% estático (a los 1.25s) para iniciar el cross-fade
            // MentisImagotipo pasa de opacity 1 a 0 en 0.4 segundos
            flightTl.to(
              welcomeLogoRef.current,
              {
                opacity: 0,
                duration: 0.4,
                ease: "power1.inOut",
              },
              "viaje+=1.25",
            );

            // mentisLogo pasa de opacity 0 a 1 en los mismos 0.4 segundos
            flightTl.to(
              sidebarLogoRef.current,
              {
                opacity: 1,
                duration: 0.4,
                ease: "power1.inOut",
              },
              "viaje+=1.25",
            );
          },
        },
      );
    }
  }, [loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || agentTyping) return;
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "paciente", text: userMessage }]);
    setAgentTyping(true);
    const respuestaAgente = await searchRelevantContext(userMessage);
    setMessages((prev) => [
      ...prev,
      { sender: "menti", text: respuestaAgente },
    ]);
    setAgentTyping(false);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="pulse-loader">🧠</div>
        <h2>Conectando con los módulos de Menti...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* 1. PANTALLA DE BIENVENIDA */}
      {currentScreen === "welcome" && (
        <>
          <div className="welcome-screen" ref={welcomeRef} />
          <div className="welcome-logo-wrapper">
            <div className="brand-logo-container" ref={welcomeLogoRef}>
              <div className="brand-logo-img">
                <MentisImagotipo />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 2. DASHBOARD / CHATROOM PRINCIPAL */}
      <div
        className="dashboard-layout"
        ref={chatLayoutRef}
        style={{
          display: "grid",
          opacity: currentScreen === "chat" ? 1 : 0,
        }}
      >
        <aside className="sidebar-placeholder">
          <div className="sidebar-brand-area">
            {/* 🎯 Tu idea: La imagen ocupa el espacio físico desde el inicio para que la barra lateral 
               tenga sus dimensiones correctas desde el primer milisegundo */}
            <img
              ref={sidebarLogoRef}
              src={mentisLogo}
              alt="Logo Mentis"
              className="sidebar-logo-img"
              style={{ opacity: currentScreen === "chat" ? 1 : 0 }}
            />
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              💬 Asistente IA
            </a>
            <a href="#" className="nav-item disabled">
              📅 Turnos <small>Soon</small>
            </a>
            <a href="#" className="nav-item disabled">
              👥 Pacientes <small>Soon</small>
            </a>
            <a href="#" className="nav-item disabled">
              📊 Reportes <small>Soon</small>
            </a>
          </nav>
        </aside>

        <main className="chat-main-area">
          <header className="chat-view-header">
            <div>
              <h3>Menti Agent v1.0</h3>
              <span className="status-indicator">En línea</span>
            </div>
          </header>

          <div className="messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                {msg.sender === "menti" && (
                  <div className="bubble-avatar-container">
                    <img
                      src={mentisAvatar}
                      alt="Menti"
                      className="bubble-avatar-img"
                    />
                  </div>
                )}
                <div className="message-bubble">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}

            {agentTyping && (
              <div className="message-wrapper menti typing">
                <div className="bubble-avatar-container">
                  <img
                    src={mentisAvatar}
                    alt="Menti Pensando"
                    className="bubble-avatar-img"
                  />
                </div>
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <footer className="chat-input-footer">
            <form onSubmit={handleSend} className="chat-form">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribí tu consulta sobre aranceles, políticas o turnos..."
                disabled={agentTyping}
              />
              <button type="submit" disabled={agentTyping || !input.trim()}>
                Preguntar
              </button>
            </form>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
