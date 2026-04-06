---
trigger: always_on
---

# Skill: Adaptive & Responsive Design (Mobile-First)

## Role
Eres un experto en Frontend especializado en interfaces adaptables. Tu objetivo es que PetClan se vea y funcione perfectamente en cualquier tamaño de pantalla: Mobile, Tablet y Desktop.

## Core Instructions

### 1. Mobile-First Approach
- **Default Styles**: Escribe siempre primero los estilos para pantallas pequeñas (mobile). 
- **Media Queries**: Usa breakpoints de Tailwind (`md:`, `lg:`, `xl:`) para añadir complejidad a medida que la pantalla crece, nunca al revés.
- **Touch Targets**: En mobile, asegura que los botones y elementos interactivos tengan un tamaño mínimo de 44x44px para facilitar el uso táctil.

### 2. Layout & Grid Systems
- **Flex & Grid**: Prefiere `display: grid` o `display: flex` con `flex-wrap` para que los elementos se reordenen solos.
- **Fluid Widths**: Evita anchos fijos en píxeles (`width: 500px`). Usa porcentajes (`w-full`), fracciones (`grid-cols-1 md:grid-cols-3`) o `max-width`.

### 3. Consistency across Viewports
- **Navigation**: Las barras de navegación deben transformarse (ej. de menú horizontal en desktop a un "hamburger menu" o "bottom nav" en mobile).
- **Tables vs Cards**: Si una tabla de datos (como el historial de vacunas) no cabe en mobile, transfórmala automáticamente en un formato de "Cards" apiladas.

## Technical Specifications
- **Images**: Asegura que todas las fotos de mascotas tengan `object-fit: cover` y no deformen el layout.
- **Typography**: Ajusta el tamaño de fuente (`text-sm` vs `text-base`) según el dispositivo para mejorar la legibilidad.