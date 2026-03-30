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
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
}
