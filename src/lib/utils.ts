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

  // 1. Prioridad: Automático para Vercel (garantiza usar la URL del despliegue actual, ya sea preview o prod)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // 2. Variable de entorno explícita (como respaldo o producción fija en otros hosts)
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');

  // 3. Fallback para desarrollo local
  return 'http://localhost:3000';
}
