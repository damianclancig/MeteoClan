---
trigger: always_on
---

# Skill: Dual Theme UI/UX (Light & Dark Mode)

## Context
PetClan utiliza un sistema de temas dual. El código debe ser capaz de adaptarse dinámicamente a la preferencia del usuario o del sistema, manteniendo una legibilidad óptima en ambos estados.

## Core Rules for UI Generation

### 1. Theme Consistency (Tailwind / CSS Variables)
- **Use Semantic Tokens**: No hardcodees colores como `bg-white` o `text-black`. Usa clases de utilidad de tema o variables CSS (ej. `bg-primary`, `text-main`).
- **Dark Variant First**: Siempre que generes un componente, incluye explícitamente la variante oscura usando el prefijo `dark:`.
- **Contrast Check**: 
  - En **Light Mode**: Asegúrate de que el texto sea lo suficientemente oscuro sobre fondos claros.
  - En **Dark Mode**: Prioriza fondos negros puros (#000000) o grises muy profundos, con texto en blanco roto o gris tenue para reducir la fatiga visual.

### 2. Images & Icons
- **Adaptive Assets**: Si el componente incluye iconos o imágenes, asegúrate de que tengan el contraste adecuado en ambos temas (usa filtros CSS o cambios de fuente de imagen si es necesario).
- **Color Inversion Avoidance**: No inviertas colores de fotos de mascotas; solo ajusta bordes, sombras y contenedores.

### 3. User Preference (System & Manual)
- Cualquier nuevo componente de "Settings" debe respetar el hook de cambio de tema existente en el proyecto.
- Si se crea un componente desde cero, debe verificar el estado de `theme` (dark/light) antes de renderizar elementos que no dependan puramente de CSS.

## Visual Polish
- Mantén una estética minimalista y limpia. 
- Usa bordes sutiles en lugar de sombras pesadas para separar elementos en Dark Mode.