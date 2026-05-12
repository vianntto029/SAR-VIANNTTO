# Programa ACAR Sabatino - Registro de Asistencia

Sistema de registro de asistencia por codigo QR para el Programa ACAR Sabatino.

---

## Configuracion

### 1. Firebase

Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com):

1. Build → Realtime Database → Create Database (test mode)
2. Project Settings → Configuración general → Copiar `firebaseConfig`
3. Reemplazar los valores en `src/firebase.js`

### 2. Vercel

1. Subir este código a GitHub
2. Importar en [vercel.com](https://vercel.com)
3. Vercel hace deploy automáticamente

---

## Acceso

- **App:** `https://tu-proyecto.vercel.app/`
- **Admin:** `https://tu-proyecto.vercel.app/login`
- **Contrasena:** `acar2026`

---

## Campos del registro

- Nombre del joven
- Cedula (evita duplicados el mismo dia)
- Seccion / Grupo
- Nombre del representante
- Materia (fija desde el QR)

---

## Funcionalidades

- QR por materia
- Evita registro duplicado (misma cedula + misma fecha)
- Exportacion a Excel con una hoja por materia
- Panel docente con tabla en tiempo real

---

## Para agregar tu logo

Reemplazar `public/favicon.svg` con tu logo de ACAR (svg recomendado).

---

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev         # Desarrollo
npm run build       # Produccion
```