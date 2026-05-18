# Bitácora de Desarrollo - Sistema Automático de Registro Vianntto

> **Documento maestro del proyecto**
> Incluye: Acta de Proyecto, PRD inicial, Bitácora por sesiones y Roadmap

---

## Índice

1. [Acta de Proyecto](#acta-de-proyecto)
2. [PRD - Product Requirements Document](#prd---product-requirements-document)
3. [Bitácora por Sesiones](#bitácora-por-sesiones)
4. [Arquitectura Técnica](#arquitectura-técnica)
5. [Roadmap - Próximas Iteraciones](#roadmap---próximas-iteraciones)

---

## Acta de Proyecto

| Campo | Valor |
|-------|-------|
| **Nombre del proyecto** | Sistema Automático de Registro Vianntto |
| **Fecha de inicio** | 14 de mayo de 2026 |
| **Cliente / Propietario** | Vianntto |
| **Tecnología base** | React 19 + Vite 8 + Firebase Realtime Database |
| **Repositorio** | `github.com/vianntto029/Formulario-Automatizado-de-Asistencia-Programa-ACAR` (original) |
| **Carpeta local** | `E:\REGISTRO INTELIGENTE VIANNTTO\SAR-VIANNTTO` |
| **Estado actual** | Iteración 1 completada (renombrado + encuestas) |
| **Contraseña admin** | `vianntto2026` |
| **ID corto** | `SAR-VIANNTTO` |

### Alcance del proyecto

Sistema web de registro inteligente con tres capas: login administrativo, panel facilitador con generación de códigos QR, y formularios de registro para participantes. Incluye módulo de encuestas exploratorias personalizables con captura de respuestas en tiempo real y exportación a Excel.

### Stakeholders

- **Product Owner:** Vianntto
- **Desarrollador:** AI-assisted (OpenCode)
- **Usuarios finales:** Facilitadores (admin), Participantes (registro + encuestas)

---

## PRD - Product Requirements Document

### 1. Visión del producto

Sistema web SPA (Single Page Application) que permite a facilitadores generar códigos QR para registrar participantes en proyectos y aplicar encuestas de satisfacción personalizables, con visualización en tiempo real y exportación de datos.

### 2. Usuarios y roles

| Rol | Descripción | Ruta de acceso |
|-----|-------------|----------------|
| **Facilitador** | Administra proyectos, genera QR, visualiza registros, exporta datos, diseña encuestas | `/login` → `/admin` |
| **Participante** | Se registra escaneando QR o llenando formulario manual | `/` (asistencia), `/encuesta` (encuestas) |

### 3. Funcionalidades por módulo

#### Módulo 1: Autenticación (`/login`)
- Acceso mediante contraseña única (`vianntto2026`)
- Persistencia de sesión vía `localStorage`
- Redirección automática al panel si hay sesión activa

#### Módulo 2: Panel Facilitador (`/admin`)

**2.1 Barra de organización**
- Selector desplegable de organización activa
- Persistencia de selección en `localStorage`

**2.2 Banner principal - Generación de QR para registro**
- **Lista de proyectos:** CRUD completo con persistencia en Firebase
- **Inputs rápidos:** Campos de texto para organización y proyecto con auto-label preview en vivo
- **Generación de QR:** Botón confirmar → genera QR con URL `/`?organizacion=&proyecto=
- **Acciones QR:** Abrir formulario en nueva pestaña, copiar enlace al portapapeles

**2.3 Banner secundario - Encuesta Exploratoria**
- Inputs rápidos para organización y proyecto con auto-label preview
- Botón "Personalizar Encuesta" que abre modal de edición de preguntas
- Modal con lista dinámica de preguntas: agregar, editar texto, eliminar
- Finalización guarda encuesta en Firebase y devuelve ID
- Generación de QR con URL `/encuesta`?organizacion=&encuesta=&proyecto=

**2.4 Barra de herramientas**
- Selector de fecha activa (default: hoy, zona horaria Caracas)
- Botón "Hoy" para volver a fecha actual
- Botón "Excel Asistencia" → exporta registros del día a Excel (agrupado por proyecto)
- Botón "Excel Encuestas" → exporta respuestas de encuesta del día a Excel (columnas dinámicas)
- Botón "Reiniciar día" → elimina todos los registros de la fecha seleccionada

**2.5 Lista de asistencia en vivo**
- Tabla con columnas: Hora, Nombre, Cédula, Departamento, Organización, Proyecto
- Actualización en tiempo real vía Firebase `onValue`
- Filtrada por fecha seleccionada

**2.6 Lista de respuestas de encuesta en vivo**
- Tabla con columnas: Hora, Participante, Proyecto, Respuestas
- Las respuestas se muestran como lista anidada: Q1:, Q2:, etc.
- Actualización en tiempo real vía Firebase `onValue`

#### Módulo 3: Registro de Participante (`/`)
- Lectura de parámetros URL: `organizacion`, `proyecto`
- Campos del formulario: Nombre (req), Cédula (req), Departamento (req), Organización (opcional)
- Validación de duplicados: misma cédula + misma fecha → error
- Animación de éxito al registrar (glass card con checkmark pulsante)
- Enlace al panel administrativo

#### Módulo 4: Encuesta de Participante (`/encuesta`)
- Lectura de parámetros URL: `organizacion`, `encuesta`, `proyecto`
- Carga dinámica de preguntas desde Firebase
- Campo "Tu nombre" (requerido)
- Preguntas renderizadas dinámicamente según configuración
- Validación: todas las preguntas deben ser respondidas
- Animación de éxito al enviar

#### Módulo 5: Exportación Excel
- **Asistencia:** Un worksheet por proyecto, headers fijos, filas ordenadas por hora
- **Encuestas:** Un worksheet por proyecto, columnas dinámicas según número de respuestas, filas ordenadas por hora
- Ambos usan ExcelJS con carga dinámica (`await import`)

### 4. Estructura de datos (Firebase Realtime Database)

```json
{
  "organizaciones": {
    "SAR_VIANNTTO": {
      "proyectos": {
        "-KEY": { "nombre": "Nombre del Proyecto" }
      },
      "attendance": {
        "-KEY": {
          "name": "Juan Perez",
          "nationalId": "V-12345678",
          "departamento": "Administración",
          "organizacion": "Mi Organización",
          "proyecto": "NombreProyecto",
          "date": "2026-05-14",
          "time": "10:30",
          "code": "SAR-VIANNTTO-2026-05-14",
          "orgId": "SAR_VIANNTTO"
        }
      },
      "encuestas": {
        "-KEY": {
          "preguntas": [
            { "texto": "¿Cómo te sentiste durante la experiencia?" },
            { "texto": "Del 1 al 10, qué tan digerible estuvo el contenido" }
          ],
          "createdAt": "2026-05-14T12:00:00.000Z"
        }
      },
      "respuestas_encuesta": {
        "-KEY": {
          "encuestaId": "-KEY123",
          "proyecto": "NombreProyecto",
          "respuestas": {
            "0": "Muy bien",
            "1": "8"
          },
          "participante": "Juan Perez",
          "date": "2026-05-14",
          "time": "11:00"
        }
      }
    }
  }
}
```

### 5. Reglas de Firebase (modo test)

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 6. Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | React | 19.2.5 |
| Build | Vite | 8.0.10 |
| Lenguaje | JavaScript (JSX) | ES Modules |
| Routing | react-router-dom | 7.15.0 |
| DB | Firebase Realtime Database | 12.13.0 |
| QR | qrcode.react | 4.2.0 |
| Excel | exceljs (dynamic import) | 4.4.0 |
| Iconos | lucide-react | 1.14.0 |
| Fuente | Sora (Google Fonts) | weights 300-800 |
| Estilos | CSS puro (App.css) | - |
| Deploy | Vercel | - |

### 7. KPIs y métricas de éxito

- Build exitoso sin errores
- Registro de asistencia con detección de duplicados
- Encuestas con preguntas dinámicas funcionales
- Exportación Excel con datos correctos
- Actualización en tiempo real de ambas listas

---

## Bitácora por Sesiones

### Sesión 1: Análisis y Planificación (14 Mayo 2026)

**Duración:** 1 hora aprox.

**Objetivo:** Comprender el proyecto base y planificar la migración.

**Actividades:**
1. Exploración completa del proyecto `ACAR` (original)
2. Lectura de todos los archivos fuente: `AttendanceContext.jsx`, `AdminView.jsx`, `StudentView.jsx`, `LoginView.jsx`, `App.jsx`, `App.css`, `firebase.js`, `index.html`
3. Identificación de tecnologías, rutas, estructura de datos Firebase, y lógica de negocio

**Hallazgos del proyecto original:**
- React 19 + Vite 8 como stack
- Firebase Realtime Database con paths: `institutos/{id}/materias`, `institutos/{id}/attendance`
- 3 rutas: `/` (StudentView), `/login` (LoginView), `/admin` (AdminView)
- QR generado con `qrcode.react` para enlaces con `?instituto=&materia=`
- Campos de registro: nombre, cédula, sección, representante
- Exportación Excel con ExcelJS, agrupado por materia
- Animaciones CSS con glass morphism y transiciones cubic-bezier

**Decisiones de diseño tomadas:**
- Cambiar "materias" → "PROYECTOS", "instituto" → "ORGANIZACIÓN"
- Campos de registro: eliminar "sección" y "representante", agregar "departamento" y "organización"
- Sistema mixto: mantener lista de proyectos + agregar inputs rápidos con auto-label
- Abreviatura corta: `SAR-VIANNTTO` para códigos, IDs, archivos
- Display name: "Sistema Automático de Registro Vianntto"
- Crear nuevo proyecto Firebase más adelante

---

### Sesión 2: Renombrado Completo (14 Mayo 2026)

**Duración:** 30 min aprox.

**Objetivo:** Ejecutar el renombrado de todas las referencias a "ACAR", "materia", "instituto" en el código y archivos.

**Cambios realizados:**

| Archivo | Modificaciones |
|---------|---------------|
| `AttendanceContext.jsx` | `INSTITUTOS` → `ORGANIZACIONES`, `institutoActivo` → `organizacionActiva`, `materias` → `proyectos`, `addMateria` → `addProyecto`, `deleteMateria` → `deleteProyecto`, `switchInstituto` → `switchOrganizacion`, Firebase paths `institutos/` → `organizaciones/`, `dailyCode` con firma `(orgId, date)`, campos de `registerAttendance` actualizados |
| `AdminView.jsx` | Variables, handlers, textos, URL params, columnas de tabla, Excel headers/filename, título del panel |
| `StudentView.jsx` | Parámetros URL, campos del formulario, labels, import actualizado |
| `LoginView.jsx` | Título, password (`acar2026` → `vianntto2026`) |
| `App.css` | Clases CSS: `.materias-panel` → `.proyectos-panel`, `.instituto-bar` → `.organizacion-bar`, etc. |
| `index.html` | `<title>` |
| `README.md` | Documentación actualizada |

**Archivos renombrados:**
- Carpeta `ACAR/` → `SAR-VIANNTTO/`

**Resultado:** Build exitoso (`npm run build` sin errores).

---

### Sesión 3: Sistema Mixto - Inputs Rápidos (14 Mayo 2026)

**Duración:** 20 min aprox.

**Objetivo:** Agregar inputs rápidos con auto-label preview y botón confirmar para generación de QR sin necesidad de usar la lista persistente.

**Cambios realizados:**

| Archivo | Modificaciones |
|---------|---------------|
| `AdminView.jsx` | Nuevo estado: `quickOrg`, `quickProy`, `quickConfirmed`. Lógica de `qrLink` con soporte dual (lista/input). Función `handleQuickConfirm`. Render condicional del QR panel. Sección `.quick-qr-section` con inputs + labels preview + botón |
| `App.css` | Nuevos estilos: `.quick-qr-section`, `.quick-qr-field`, `.quick-label-preview`, `.quick-confirm-btn` |

**Comportamiento:** Al escribir en los campos, los labels preview se actualizan en vivo. Al hacer clic en "Generar QR", se activa el modo quick y el QR se genera en el panel central. Hacer clic en un proyecto de la lista desactiva el modo quick y viceversa.

**Resultado:** Build exitoso.

---

### Sesión 4: Sistema de Encuestas - Fase Completa (14 Mayo 2026)

**Duración:** 45 min aprox.

**Objetivo:** Implementar el módulo completo de encuestas exploratorias con personalización de preguntas, segundo banner QR, formulario dinámico y segunda lista en vivo.

**Cambios realizados:**

| Archivo | Modificaciones |
|---------|---------------|
| `firebase.js` | Export `child` para consultas directas |
| `AttendanceContext.jsx` | Nuevos estados: `encuestas`, `respuestasEncuesta` con listeners Firebase. Nuevas funciones: `saveEncuesta()`, `getEncuestaById()`, `submitEncuestaResponse()`. Nuevos paths: `organizaciones/{org}/encuestas`, `organizaciones/{org}/respuestas_encuesta` |
| `AdminView.jsx` | Segundo banner `.encuesta-panel` con inputs rápidos, botón "Personalizar Encuesta", modal de edición de preguntas, botón "Finalizar encuesta", segunda tabla "Respuestas de Encuesta" en vivo |
| `SurveyView.jsx` | **NUEVO.** Ruta `/encuesta` con carga dinámica de preguntas desde Firebase, validación, envío de respuestas, animación de éxito |
| `App.jsx` | Nueva ruta: `/encuesta` → `SurveyView` |
| `App.css` | Estilos completos: `.encuesta-panel`, modal overlay/modal content, `.modal-pregunta-row`, `.respuestas-cell`, `.respuestas-list-inline` |

**Flujo de encuesta completo:**
1. Admin abre modal → agrega N preguntas → "Finalizar" guarda en Firebase
2. Admin escribe organización + proyecto → labels preview → "Generar QR"
3. QR genera URL: `/encuesta?organizacion=XX&encuesta=YY&proyecto=ZZ`
4. Participante escanea → ve preguntas dinámicas → responde → envía
5. Admin ve respuesta en tiempo real en segunda tabla

---

### Sesión 5: Integraciones y Correcciones (14 Mayo 2026)

**Duración:** 15 min aprox.

**Objetivo:** Conectar todas las funciones faltantes y asegurar integridad del flujo de datos.

**Correcciones realizadas:**

1. **Survey QR URL**: Agregado `&proyecto=` al `surQrLink` para incluir el proyecto en el enlace
2. **SurveyView**: Lectura de `proyectoParam` desde URL y envío a `submitEncuestaResponse()`
3. **Excel Encuestas**: Nueva función `exportExcelEncuesta()` con columnas dinámicas (una columna por respuesta), worksheet por proyecto, auto-filter, frozen panes
4. **Toolbar**: Botón "Excel Encuestas" junto al de "Excel Asistencia"
5. **Display de respuestas**: Numeración 1-indexada (Q1, Q2...) en la tabla admin
6. **Preview panel**: Mensaje informativo de estado de la encuesta

**Verificación final:**
- 44 referencias cruzadas verificadas entre todos los archivos
- Todos los imports/exports correctos
- Build exitoso (0 errores)

---

## Arquitectura Técnica

### Estructura de Archivos (Actualizada)

```
E:\REGISTRO INTELIGENTE VIANNTTO\SAR-VIANNTTO\
  src\
    context\
      AttendanceContext.jsx     # Estado global, CRUD, Firebase listeners
    views\
      AdminView.jsx             # Panel facilitador (QR, listas, encuestas)
      StudentView.jsx           # Formulario de registro (participante)
      SurveyView.jsx            # Formulario de encuesta (participante)
      LoginView.jsx             # Login con contraseña
    App.jsx                     # Router (4 rutas) + Provider
    App.css                     # Todos los estilos (~1300 líneas)
    index.css                   # Reset + fondo global
    firebase.js                 # Config Firebase Realtime Database
  public\
    bg-hero.jpg                 # Fondo del hero-panel
    favicon.svg                 # Favicon (pendiente actualizar)
  index.html                    # Entry point + Google Fonts
  vite.config.js                # Config Vite
  vercel.json                   # Config Vercel (SPA rewrites)
  package.json                  # Dependencias
```

### Rutas de la aplicación

| Ruta | Vista | Parámetros URL | Acceso |
|------|-------|----------------|--------|
| `/` | StudentView | `?organizacion=&proyecto=` | Público (QR) |
| `/encuesta` | SurveyView | `?organizacion=&encuesta=&proyecto=` | Público (QR) |
| `/login` | LoginView | - | Público |
| `/admin` | AdminView | - | Requiere auth (`localStorage`) |

### Árbol de dependencias

```
App.jsx
  └─ AttendanceProvider (AttendanceContext.jsx)
      ├─ Firebase Realtime Database
      │   ├─ organizaciones/{org}/proyectos     (onValue listener)
      │   ├─ organizaciones/{org}/attendance    (onValue listener)
      │   ├─ organizaciones/{org}/encuestas     (onValue listener)
      │   └─ organizaciones/{org}/respuestas_encuesta (onValue listener)
      └─ RouterProvider
          ├─ / → StudentView
          ├─ /encuesta → SurveyView
          ├─ /login → LoginView
          └─ /admin → AdminView
```

### Estados del panel facilitador

| Estado | QR Panel | Inputs rápidos | Lista proyectos |
|--------|----------|----------------|-----------------|
| Sin selección | Empty state | Visibles | Ninguno activo |
| Proyecto de lista | QR generado | Ocultos/disabled | Item activo |
| Inputs rápidos + confirm | QR generado | Campo lleno + "Generado" | Ninguno activo |
| Encuesta configurada | Empty (hasta confirm) | Visibles + badge "configurada" | - |
| Encuesta + QR | QR generado | "Generado" | - |

### Scripts disponibles

```bash
npm run dev          # Desarrollo (localhost:5173)
npm run build        # Build producción
npm run preview      # Preview del build local
```

---

## Roadmap - Próximas Iteraciones

### Iteración 2: Diseño Visual y Branding

- [ ] Nueva paleta de colores (definir con el cliente)
- [ ] Nuevo logotipo y favicon
- [ ] Actualización de la imagen de fondo (`bg-hero.jpg`)
- [ ] Ajustes de tipografía y espaciado
- [ ] Tema coherente en todo el sistema

### Iteración 3: Infraestructura Firebase

- [ ] Crear nuevo proyecto Firebase
- [ ] Configurar Realtime Database
- [ ] Actualizar `firebase.js` con nuevas credenciales
- [ ] Migrar datos existentes si es necesario
- [ ] Establecer reglas de seguridad adecuadas

### Iteración 4: Features Avanzados

- [ ] Exportación Excel de encuestas con preguntas como headers
- [ ] Vista detalle de respuestas de encuesta por participante
- [ ] Estadísticas y gráficos básicos de encuestas
- [ ] Múltiples organizaciones intercambiables
- [ ] Editor de encuestas: editar preguntas existentes (no solo crear nuevas)
- [ ] Filtros avanzados en tablas (por proyecto, por rango de fechas)
- [ ] Paginación en listas grandes

### Iteración 5: Calidad y UX

- [ ] Pruebas de usuario con facilitadores reales
- [ ] Optimización de rendimiento (code splitting, lazy loading)
- [ ] Manejo de errores mejorado (Firebase offline, reconexión)
- [ ] Accesibilidad (aria labels, contraste, navegación por teclado)
- [ ] Testing (unit tests con Vitest, component tests)
- [ ] CI/CD pipeline completo

### Iteración 6: Producción

- [ ] Configurar dominio personalizado
- [ ] SSL / HTTPS
- [ ] Monitoreo y analytics
- [ ] Documentación de usuario final
- [ ] Manual de administración

---

*Documento generado el 14 de mayo de 2026.*
*Próxima actualización: al completar la Iteración 2.*
