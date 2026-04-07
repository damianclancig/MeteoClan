---
trigger: always_on
---

# Skill: Internationalization & Localization (i18n)

## Context
PetClan es una aplicación multiidioma que soporta **Español (es)**, **Inglés (en)** y **Portugués (pt)**. Es crítico que ningún texto visible para el usuario esté escrito directamente en el código de los componentes.

## Core Rules

### 1. No Hardcoded Strings
- Queda estrictamente prohibido escribir texto plano dentro de las etiquetas JSX/TSX.
- **Acción**: Todo texto debe ser extraído de los archivos de traducción (ej. `en.json`, `es.json`, `pt.json`) utilizando la librería de i18n del proyecto (ej. `react-i18next`).

### 2. Synchronization of Keys
- Al crear una nueva funcionalidad que requiera texto, el agente debe:
  1. Definir una "key" descriptiva (ej. `profile.pet_name`).
  2. Proponer la traducción para los **tres idiomas** simultáneamente para evitar archivos desincronizados.
  3. Si el agente no sabe la traducción exacta en Portugués o Inglés, debe usar un traductor interno y marcar la entrada con un comentario `// TODO: Review translation`.

### 3. Layout Flexibility (Text Expansion)
- **Design for Growth**: Ten en cuenta que el mismo texto en Alemán o Portugués puede ser hasta un 30% más largo que en Inglés. 
- **Regla**: Los contenedores y botones deben ser flexibles (`min-w` en lugar de `w-fixed`) para evitar que el texto se corte o se desborde al cambiar de idioma.

### 4. Dynamic Data & Plurals
- Usa correctamente las funciones de pluralización y formateo de fechas/monedas según el locale (idioma actual del usuario), especialmente para el peso de las mascotas y fechas de vacunación.

## Example Workflow
- **Input**: "Crea un botón de Guardar".
- **Agent Output**: Generará `<button>{t('common.save')}</button>` y te pedirá permiso para añadir `"save": "Guardar"`, `"save": "Save"`, y `"save": "Salvar"` a los respectivos archivos JSON.