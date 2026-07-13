import { useEffect, useState, useRef } from "react";
import { initializeRAGStore, searchRelevantContext } from "./services/ragAgent";
import { gsap } from "gsap";
import ReactMarkdown from "react-markdown";
import Lenis from "lenis";
import "./App.css";
import MentisImagotipo from "./components/MentisImagotipo";
import MentisIsotipo from "./components/MentisIsotipo";
import mentisLogo from "/Imagotipo_Mentis_static.svg";
import mentisAvatar from "/Avatar.png";

interface Message {
  sender: "paciente" | "menti";
  text: string;
}

function App() {
  //useState
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "chat">(
    "welcome",
  );
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentTyping, setAgentTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);

  // Referencias para elementos del DOM
  const welcomeRef = useRef<HTMLDivElement>(null);
  const chatLayoutRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Referencias para los contenedores del logo (Origen y Destino)
  const welcomeLogoRef = useRef<HTMLDivElement>(null);
  const sidebarLogoRef = useRef<HTMLImageElement>(null);
  const mobileLogoRef = useRef<HTMLImageElement>(null);

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

  // Ajustar altura real libre del teclado en móviles
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const currentHeight = window.visualViewport?.height;
      if (currentHeight !== undefined && currentHeight !== null) {
        document.documentElement.style.setProperty(
          "--viewport-height",
          `${currentHeight}px`,
        );
      }
    };

    window.visualViewport.addEventListener("resize", handleResize);
    window.visualViewport.addEventListener("scroll", handleResize); // Evita desfases en iOS
    handleResize();

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
      window.visualViewport?.removeEventListener("scroll", handleResize);
    };
  }, []);

  // Inicialización del RAG Store
  useEffect(() => {
    initializeRAGStore().then(() => {
      setLoading(false);
      setMessages([
        {
          sender: "menti",
          text: "¡Hola! Soy Menti, tu asistente. ¿Qué duda tenés sobre el consultorio de la Lic. Carina Bosio?",
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
      const isMobile = window.innerWidth <= 768 || navigator.maxTouchPoints > 0;
      // Solo forzamos el foco si NO es un dispositivo móvil
      if (!isMobile) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 30);
      }
    }
  }, [agentTyping, currentScreen]);

  //Lobby animation
  useEffect(() => {
    if (!loading) {
      // Ocultamos AMBOS logos fijos al arrancar para evitar fugas en mobile
      gsap.set(chatLayoutRef.current, { opacity: 0, y: 20 });
      gsap.set(sidebarLogoRef.current, { opacity: 0 });
      gsap.set(mobileLogoRef.current, { opacity: 0 });

      const mainTimeline = gsap.timeline();

      // Animamos la entrada inicial del logo en el Lobby
      mainTimeline.fromTo(
        welcomeLogoRef.current,
        { opacity: 0, scale: 0.85, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power4.out" },
      );

      // Tiempo de espera para disfrutar la animación SVG inicial antes del viaje
      mainTimeline.to({}, { duration: 6.0 });

      // Vuelo dinámico usando la posición real de la imagen oculta
      mainTimeline.to(
        {},
        {
          duration: 0,
          onComplete: () => {
            if (!welcomeLogoRef.current || !sidebarLogoRef.current) return;

            // Evaluamos si la pantalla es mobile (< 768px)
            const isMobile = window.innerWidth <= 768;

            // Si es mobile, el objetivo métrico es el logo de la cabecera; si es escritorio, la barra lateral
            const targetLogo = isMobile
              ? mobileLogoRef.current
              : sidebarLogoRef.current;
            if (!targetLogo) return;

            // Medimos el logo en el centro (origen) y el logo destino real en la pantalla
            const first = welcomeLogoRef.current.getBoundingClientRect();
            const last = targetLogo.getBoundingClientRect();

            // Calculamos las distancias métricas perfectas en X e Y adaptadas al entorno
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

            // 3. El logo viaja de forma fluida hacia el destino calculado
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

            // 4. Cross-fade impecable justo cuando termina el viaje (posición "viaje+=1.1")
            flightTl.to(
              welcomeLogoRef.current,
              {
                opacity: 0,
                duration: 0.3,
                ease: "power1.inOut",
              },
              "viaje+=1.1",
            );

            flightTl.to(
              targetLogo,
              {
                opacity: 1,
                duration: 0.3,
                ease: "power1.inOut",
              },
              "viaje+=1.1",
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
        <div className="pulse-loader">
          <MentisIsotipo />
        </div>
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
        className={`dashboard-layout ${menuOpen ? "menu-active" : ""}`}
        ref={chatLayoutRef}
        style={{
          opacity: currentScreen === "chat" ? 1 : 0,
        }}
      >
        {/* Agregamos una máscara de fondo sutil para cerrar el menú mobile al hacer clic afuera */}
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />

        <aside className="sidebar-placeholder">
          <div className="sidebar-brand-area">
            <img
              ref={sidebarLogoRef}
              src={mentisLogo}
              alt="Logo Mentis"
              className="sidebar-logo-img"
              style={{ opacity: currentScreen === "chat" ? 1 : 0 }}
            />
          </div>

          {/* Menú de navegación principal superior */}
          <nav className="sidebar-nav">
            <a
              href="#"
              className="nav-item active"
              onClick={() => setMenuOpen(false)}
            >
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

          {/* Footer de la barra lateral */}
          <div className="sidebar-footer">
            <button
              className="btn-telegram-omni"
              onClick={() => {
                setMenuOpen(false); // Cierra el menú mobile si estaba abierto
                setTelegramModalOpen(true); // Abre nuestro popup
              }}
            >
              <svg className="telegram-icon" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.62.15-.15 2.73-2.5 2.78-2.7.01-.03.01-.15-.06-.21-.07-.06-.17-.04-.25-.02-.11.02-1.85 1.17-5.23 3.45-.5.34-.95.51-1.35.5-.44-.01-1.29-.25-1.92-.45-.77-.25-1.39-.39-1.34-.83.03-.23.35-.46.97-.71 3.79-1.65 6.32-2.74 7.59-3.27 3.61-1.5 4.36-1.76 4.85-1.77.11 0 .35.03.51.16.13.11.17.27.19.39-.01.07.01.21 0 .26z" />
              </svg>
              <span>Abrir en Telegram</span>
            </button>
          </div>
        </aside>

        <main className="chat-main-area">
          <header className="chat-view-header">
            {/* LOGO RESPONSIVE */}
            <img
              ref={mobileLogoRef}
              src={mentisLogo}
              alt="Logo Mentis Mobile"
              className="mobile-header-logo"
            />

            <div className="header-info-group">
              <h3>Menti Agent v1.0</h3>
              <span className="status-indicator">En línea</span>
            </div>

            {/* BOTÓN HAMBURGUESA */}
            <button
              className={`hamburger-menu-btn ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Abrir menú"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </header>

          <div className="messages-container" data-lenis-prevent>
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

      {/* POPUP PARA ABRIR TELEGRAM */}

      {telegramModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setTelegramModalOpen(false)}
        >
          <div className="telegram-popup" onClick={(e) => e.stopPropagation()}>
            <h3>¿Cómo preferís abrir Telegram?</h3>
            <p>Elegí la opción que mejor se adapte a tu dispositivo:</p>

            <div className="popup-actions">
              {/* Opción 1: Abre directo la App sin pestañas basura */}
              <a
                href="tg://resolve?domain=MentiAgentBot"
                className="popup-btn app-link"
                onClick={() => setTelegramModalOpen(false)}
              >
                🚀 Abrir en la Aplicación
                <small>Recomendado si tenés la app instalada</small>
              </a>

              {/* Opción 2: Abre la versión Web en pestaña nueva */}
              <a
                href="https://web.telegram.org/k/#@MentiAgentBot"
                target="_blank"
                rel="noopener noreferrer"
                className="popup-btn web-link"
                onClick={() => setTelegramModalOpen(false)}
              >
                🌐 Usar Telegram Web
                <small>Se abrirá en una nueva pestaña</small>
              </a>
            </div>

            <button
              className="popup-close-btn"
              onClick={() => setTelegramModalOpen(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
