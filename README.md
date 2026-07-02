# Mentis: Agente Clínico Inteligente RAG
Asistente virtual autónomo diseñado para la autogestión de información, encuadre y políticas del consultorio psicológico de la **Lic. Carina Bosio**.

<img src="public/Isotipo_Mentis.png" width="180" alt="Avatar de Menti">

## 🚀 Acerca del Proyecto
Mentis nació como un desafío técnico para resolver una necesidad real del ámbito clínico: optimizar la comunicación de normativas, horarios y encuadres psicoterapéuticos con los pacientes. Este proyecto me permitió profundizar la integración de mi formación en **Psicología con el desarrollo Frontend y la Inteligencia Artificial**.

El objetivo principal fue crear a **Menti**, un asistente que no solo sea un recuperador de datos frío, sino una interfaz que mantenga la calidez y el respeto por el encuadre profesional. Incorpora una UX fluida mediante animaciones dinámicas que reducen la fricción cognitiva del usuario durante la espera de respuestas complejas.

## 🛠️ Stack Tecnológico
| **Componente** | **Tecnologías y Librerías Utilizadas** |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript, CSS Moderno, GSAP (GreenSock Animation Platform) |
| **Renderizado** | React Markdown (procesamiento limpio de textos devueltos por la IA) |
| **Orquestación** | n8n (Flujos lógicos, agentes autónomos avanzados y memoria de sesión) |
| **IA & Lenguaje** | Cohere Chat Model (Modelo `command-r-plus` para la generación avanzada de respuestas) |
| **Embeddings** | Cohere Embeddings (Procesamiento y vectorización multilingüe para el contexto RAG) |
| **Base Vectorial** | Neon Serverless PostgreSQL (con extensión `pgvector` para el almacén RAG) |
| **Entorno Local** | Node.js (Servidor de desarrollo acelerado por Vite en puerto 5173) |

## 🧠 Características Principales
* **Recuperación Aumentada (RAG):** Conexión nativa a la base de datos vectorial para indexar y consultar dinámicamente los documentos de políticas de admisión, ausencias, aranceles y WhatsApp del consultorio.
* **UX Premium con GSAP:** Coreografía elástica en el Lobby para la eclosión orgánica del imagotipo y la transición limpia hacia el panel de mensajes.
* **Foco Automático e Interactividad:** Retorno inmediato del enfoque (`focus`) al input de texto apenas el asistente finaliza la generación de respuesta, logrando una conversación continua.
* **Spinner Elástico Personalizado:** Indicador de carga desarrollado mediante `@keyframes` puras en CSS para mejorar la experiencia de espera (*perceived performance*).

## 🏗️ Arquitectura del Flujo (n8n)
La solución utiliza una **Cadena de Retorno (Retrieval QA Chain)** orquestada de forma visual en n8n. El agente recibe la duda del paciente, extrae los fragmentos contextuales (*chunks*) pertinentes de la base de datos en Neon, y genera una respuesta limpia libre de asteriscos crudos o alucinaciones.

<img src="public/Workflow Mentis - Chatbot RAG.png" width="900" alt="Workflow Mentis - Chatbot RAG">

## 📂 Estructura del Repositorio
* `/src`: Código fuente del frontend (Componentes de chat, lógica core de React y estilos).
* `/src/components`: Componentes aislados como `MentisImagotipo.tsx` (estructura SVG optimizada).
* `/src/services`: Conectores de API y llamadas al flujo del agente (`ragAgent.ts`).
* `/public/docs`: Base de conocimientos que alimenta el RAG (`politicas_mentis.txt`, manuales PDF).

## 💡 Desafíos Técnicos
* **Fluidez Estructural:** Mantener el scroll perfectamente encapsulado en el área de conversación, logrando que la barra lateral y la cabecera queden fijas y estables.
* **Control de Hooks en Renderizado Condicional:** Organización estricta de los hooks de React y efectos de GSAP para evitar errores en consola durante los estados de carga de la IA.
* **Máscaras de Profundidad:** Aplicación de propiedades de difuminado (`mask-image`) en los bordes del chat para evitar cortes bruscos de avatares contra el encabezado.
* **Migración de Infraestructura RAG en la Nube:** Ante las restricciones de memoria del servidor inicial (Railway), se lideró la migración completa del backend de n8n hacia Hugging Face Spaces. Esto implicó la reconfiguración y el aprovisionamiento de cero de las variables de entorno, credenciales de APIs (Cohere) y la persistencia de datos vectoriales (Neon/PostgreSQL) en un nuevo entorno virtualizado.
* **Pipeline de Ingestión Automatizada (ETL RAG) con Pastebin:** Diseño de un flujo secundario en n8n para la vectorización y normalización de las políticas del consultorio. El proceso consume de manera eficiente un endpoint plano en Pastebin (`/raw/`) simulando una API externa a través de un nodo *HTTP Request*, segmenta el contenido con un *Default Data Loader*, genera los vectores con los modelos de embeddings de *Cohere* y los almacena de forma estructurada en la base de datos vectorial de *Postgres (PGVector)* dentro de Neon.

<img src="public/Workflow Ingestión de Políticas RAG.png" width="900" alt="Workflow Ingestión de Políticas RAG">

* **Sincronización de Entornos y Gestión de Caché (Vite + Vercel):** Resolución de un conflicto crítico de persistencia de variables en el Frontend (`CORS / Failed to fetch`). El desafío consistió en depurar el ciclo de vida del *Build* de Vite y el almacenamiento en caché de Vercel, forzando compilaciones limpias (*Clear Cache and Deploy*) para purgar variables residuales e inyectar dinámicamente los nuevos endpoints de producción.
* **Seguridad y Desacoplamiento de Credenciales (Git/GitHub):** Saneamiento del árbol de Git mediante el uso de comandos avanzados de la terminal (`git rm --cached`) para desvincular archivos de entorno (`.env`) históricos que persistían de forma invisible en el repositorio, galarantizando el cumplimiento de las buenas prácticas de seguridad e integridad del código.

## 📽️ Demo Visual

### Experiencia de Chat y Animación de Entrada
<p>
  <i>Haz clic debajo para visualizar la fluidez de la interfaz y la coreografía de carga del agente Menti:</i>
</p>

[Video Demo - Interfaz y Animación de Menti](public/docs/politicas_mentis.txt) 
*(Nota: Aquí puedes enlazar o incrustar tu video subido `20260701-1831-50.2414540.mp4` directamente en la interfaz de GitHub).*

---
*Desarrollado por [CariBosio](https://github.com/CariBosio) | Psicóloga + Frontend Developer*