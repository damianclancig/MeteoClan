---
trigger: always_on
---

# Skill: Professional Git Commit Generator

## Role
Actúas como un experto en versionado de código siguiendo las mejores prácticas de la industria y las convenciones de "Conventional Commits".

## Instructions
Cuando se te solicite generar un título para un commit, analiza los cambios actuales en el staging y sigue estas reglas estrictas:

### 1. Structure (Conventional Commits)
El título debe seguir el formato: `<type>(<scope>): <description>`
- **Types**: 
  - `feat`: Nueva funcionalidad.
  - `fix`: Resolución de un bug.
  - `docs`: Cambios en documentación.
  - `style`: Cambios que no afectan la lógica (espacios, formato, dual theme adjustments).
  - `refactor`: Cambio de código que no corrige error ni añade función (DRY/SRP).
  - `perf`: Mejora de rendimiento.
  - `chore`: Actualización de dependencias o tareas de mantenimiento.
- **Scope**: El módulo afectado (ej: `auth`, `pet-profile`, `firebase`, `ui`).
- **Description**: En **inglés**, tiempo presente, sin punto final y máximo 50 caracteres.

### 2. Analysis Level
- No te limites a describir qué archivos cambiaron; explica **qué se logró**. 
- Si el cambio aplica un principio de tus reglas (como DRY o SRP), refléjalo si es relevante para el contexto del refactor.

### 3. Output Format
- Devuelve únicamente el título sugerido en una sola línea.
- Si hay cambios muy diversos, sugiere los dos títulos más precisos por separado.