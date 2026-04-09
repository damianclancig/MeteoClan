# MeteoClan - Pronóstico del Tiempo con Inteligencia Artificial

[![Screenshot de MeteoClan](https://res.cloudinary.com/dqh1coa3c/image/upload/v1772030429/MeteoClan/screenshot_dix6yd.webp)](https://clima.clancig.com.ar)

### 🚀 [Ver Demo en Vivo](https://clima.clancig.com.ar) 🚀

**MeteoClan** es una aplicación climática de vanguardia diseñada para sumergir al usuario en el estado del tiempo. A diferencia de las apps convencionales, MeteoClan utiliza **Inteligencia Artificial (Google Gemini)** para generar paisajes dinámicos en tiempo real que reflejan no solo el clima, sino la esencia visual de la ciudad consultada.

Construida con **Next.js 15**, **React 19** y una arquitectura de alto rendimiento, ofrece una experiencia fluida, inmersiva y visualmente impactante a través de un diseño "Glassmorphism" moderno.

---

## ✨ Características Destacadas

### 🤖 Paisajes Dinámicos con IA (Google Gemini)
Cada búsqueda genera una imagen de fondo única y espectacular. La IA interpreta la condición climática (lluvia, nieve, tormenta, niebla) y la ubicación geográfica para crear una atmósfera visual personalizada que cambia en tiempo real.

### 🎭 Animaciones Atmosféricas de Alta Fidelidad
No solo ves el clima, lo sientes. Hemos implementado capas de animación avanzadas:
- **Tormentas Eléctricas**: Destellos ambientales sincronizados con rayos realistas.
- **Nevadas Dinámicas**: Partículas de nieve con movimiento zigzag y acumulación visual.
- **Lluvia Inmersiva**: Efectos de gotas y niebla ambiental para una sensación de humedad real.
- **Ciclo Solar y Lunar**: Seguimiento visual en tiempo real del arco del sol y las fases de la luna con emojis dinámicos.

### 📱 Experiencia PWA (Progressive Web App)
Instala MeteoClan en tu smartphone o escritorio. Soporta modo offline básico, iconos adaptativos y una experiencia de navegación a pantalla completa sin barras de navegador.

### 🌐 Datos Precisos y Globales
- **Powered by OpenWeatherMap**: Datos actualizados al minuto con el One Call API.
- **Detalles Exhaustivos**: Humedad, viento (velocidad y dirección), presión, visibilidad, nubosidad, Índice UV y probabilidad de precipitación.
- **Pronóstico de 8 Días**: Planificación a largo plazo con detalles granulares por día.
- **Línea de Tiempo Horaria**: Visualiza la evolución del clima en las próximas 24 horas y eventos astronómicos (salida/puesta de sol y luna).

### 🌍 Multi-idioma Nativo
Soporte completo e integrado para **Español, Inglés y Portugués**, incluyendo la localización de unidades y formatos de fecha.

---

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router & Server Actions)
- **Frontend:** [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Backend Serverless:** [Firebase Functions](https://firebase.google.com/docs/functions) con [Genkit](https://firebase.google.com/docs/genkit)
- **IA:** [Google Gemini 2.0 Flash](https://ai.google.dev/) (Generación de fondos)
- **Estado y UI:** [Framer Motion](https://www.framer.com/motion/) para transiciones suaves y [Lucide React](https://lucide.dev/) para iconografía.
- **Almacenamiento:** [Firebase Storage](https://firebase.google.com/docs/storage) para el caché de imágenes generadas.

---

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 20.x o superior.
- Una cuenta en [Google AI Studio](https://aistudio.google.com/) para la API Key de Gemini.
- Un proyecto en [Firebase](https://console.firebase.google.com/) (opcional para funciones locales, requerido para desplegar).

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/damianclancig/MeteoClan.git
   cd MeteoClan
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Variables de Entorno:**
   Crea un archivo `.env.local` con las siguientes claves:
   ```env
   # API Keys
   GEMINI_API_KEY=tu_clave_de_gemini
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Firebase (Requerido para el backend de fondos)
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   # (Ver .env.local.example para la lista completa)
   ```

4. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia **ISC**. Siéntete libre de explorar, aprender y construir sobre él.

## 👨‍💻 Autor

**Damián Clancig** - Fullstack Developer especializado en experiencias interactivas y escalables.
- [Portfolio](https://www.clancig.com.ar)
- [GitHub](https://github.com/damianclancig)
- [LinkedIn](https://www.linkedin.com/in/damianclancig/)
