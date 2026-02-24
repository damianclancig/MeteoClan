import { initializeApp, getApps, getApp } from "firebase/app";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    // Configuración placeholder (requiere que el usuario ingrese sus datos en .env.local)
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-auth-domain",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project-id",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-bucket",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "demo-sender",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
};

// Singleton pattern para Firebase app en Next.js
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

if (process.env.NODE_ENV === "development") {
    console.log("[Firebase] Configurado con Proyecto ID:", firebaseConfig.projectId);
}

// Instancia de functions v2 (por defecto será la default region us-central1 al pasarlo solo el app)
export const functions = getFunctions(app, "us-central1");

// Opcional en entorno de desarrollo local, desconectar para probar emuladores si el usuario lo desea:
// import { connectFunctionsEmulator } from "firebase/functions";
// if (process.env.NODE_ENV === "development") {
//   connectFunctionsEmulator(functions, "localhost", 5001);
// }
