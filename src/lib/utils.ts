import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Obtiene la URL base de la aplicación para peticiones fetch absolutas del lado del servidor.
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return ''; // En el cliente, las rutas relativas funcionan

  // 1. Prioridad: Variable de entorno explícita (Producción)
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;

  // 2. Automático para despliegues de Vercel (Preview/Production)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // 3. Fallback para desarrollo local (puerto estándar de Next.js)
  return 'http://localhost:3000';
}
