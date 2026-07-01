/*
 * Copyright 2026 Clancig FullstackWeb
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
