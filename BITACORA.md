# Bitacora de Desarrollo - Programa ACAR Sabatino (Version 1)

## Informacion General

**Proyecto:** Formulario Automatizado de Asistencia Programa ACAR
**Ubicacion:** `H:\ACAR`
**Repo GitHub:** `github.com/vianntto029/Formulario-Automatizado-de-Asistencia-Programa-ACAR`
**Deploy:** `https://acar-asistencia.vercel.app`
**Clave Admin:** `acar2026`
**Firebase:** Realtime Database (`asistencias-acar-default-rtdb.firebaseio.com`)
**Fecha inicio:** Mayo 2026

---

## Historial de Commits

| Commit | Descripcion |
|--------|------------|
| `d408487` | Fix: Contrasena->Contraseña, add spacing to form elements |
| `d770db6` | Fix hero panel blue gradient, replace all light blues with new palette |
| `b6c49fa` | Remove all bright blue colors, replace with new palette tones |
| `7a5632a` | Gradient: exact colors #FFFFFF->#E9EEF3->#CCD9E1->#ACC2CF->#8EABC0->#7197AE->#5B84A1->#417490 |
| `990ec77` | Fix: AdminView closing tags |
| `f21ffb2` | Remove logos, update gradient blue tone |
| `b3942d5` | Fix: gradient sky blue from reference, logos width 140/180px |
| `0af77f3` | Size: logos 160px |
| `b6f6b49` | Fix: logos inside glass card on student/login, overlay style on form |
| `5eac47a` | Fix: JSX syntax error in StudentView, gradient from bottom |
| `f25ad2e` | Fix: gradient blue from bottom, logos full size above form |
| `cd1893e` | Fix: exact gradient blue-to-white, logos above form on student view |
| `bd19947` | Fix: gradient bg, logos horizontal side-by-side on login/admin/student |
| `76d0a89` | Fix: dark blue background, clean logo header layout |
| `fbb15c6` | New design: Sora font, logo header, gradient bg, hero image, floating status card |
| `7da78c8` | Add debug logs to materia add; show status feedback in form |
| `b8c6f50` | Complete blue theme with glass morphism and all fixes |
| `5efdd9e` | Switch to Realtime Database like original |
| `05856f2` | Match original: no orderBy in onSnapshot, sort in JS |
| `f5b1444` | Fix: Firestore onSnapshot - remove double orderBy on date+time |
| `2ae6f13` | vercel.json: use npx vite build explicitly, override package.json |
| `60a871c` | Use npx vite build for Vercel |
| `bace5ad` | Firebase config: Firestore backend for ACAR Sabatino |
| `703a80b` | Initial: ACAR Sabatino project with azul theme, duplicate check, representante field |

---

## Arquitectura

### Stack Tecnologico
- **Frontend:** React 18 + Vite 8
- **Estilos:** CSS puro (App.css) - sin frameworks CSS
- **Base de datos:** Firebase Realtime Database
- **Despliegue:** Vercel (auto-deploy desde GitHub)
- **Fuente:** Sora (Google Fonts)
- **Iconos:** Lucide React

### Estructura de Archivos
```
H:\ACAR\
  src\
    context\AttendanceContext.jsx   # Todo el estado global, listeners de Firebase
    firebase.js                       # Config de Firebase Realtime Database
    views\
      AdminView.jsx                  # Panel de control con QR, materias, lista
      LoginView.jsx                  # Login con contrasena acar2026
      StudentView.jsx                # Formulario de registro para estudiantes
    App.jsx                           # Router y Provider
    App.css                          # Todos los estilos (sin frameworks)
    index.css                        # Reset body + fondo global
  public\
    bg-hero.jpg                      # Imagen de fondo del hero panel
    ANAGRAMA FUNDACION.png           # (eliminado en ultimos cambios)
    LOGO-ACAR.png                    # (eliminado en ultimos cambios)
    favicon.svg                      # Favicon
  index.html                         # Google Fonts: Sora
  firebase.js                        # Config Firebase
  vite.config.js                     # Config Vite
  vercel.json                        # Build command: npx vite build
  package.json                       # Dependencias
  referencias graficas\              # Imagenes de referencia del diseno
```

### Rutas
| Ruta | Vista | Descripcion |
|------|-------|-------------|
| `/` | StudentView | Formulario de registro (acceso via QR) |
| `/login` | LoginView | Panel de login (contrasena: acar2026) |
| `/admin` | AdminView | Panel de control (requiere login) |

### URLs con parametros de QR
```
/?instituto=ACAR&materia=NombreMateria
```

---

## Base de Datos Firebase

### Estructura Realtime Database
```json
{
  "institutos": {
    "ACAR": {
      "materias": {
        "-KEY123": { "nombre": "Nombre de la Materia" },
        "-KEY456": { "nombre": "Otra Materia" }
      },
      "attendance": {
        "-KEY789": {
          "name": "Juan Perez",
          "nationalId": "V-12345678",
          "seccion": "Sabatino A",
          "representante": "Maria Perez",
          "subject": "NombreMateria",
          "date": "2026-05-12",
          "time": "10:30",
          "code": "ACAR-2026-05-12",
          "instituto": "ACAR"
        }
      }
    }
  }
}
```

### Reglas de Firebase (modo test)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

---

## Paleta de Colores Final (Version 1)

| Color | Hex | Uso |
|-------|-----|-----|
| Blanco oseo | #FFFFFF | Fondo superior |
| Gris azulado claro | #E9EEF3 | Fondo / cards |
| Gris azulado medio | #CCD9E1 | Bordes claros |
| Azul grisaceo | #ACC2CF | Bordes / headers tabla |
| Azul gris | #8EABC0 | Textos claros |
| Azul medio | #7197AE | Acentos / hover |
| Azul profundo | #5B84A1 | Botones primarios |
| Azul oscuro | #417490 | Textos principales / iconos |

**Fondo global:** gradiente de arriba (#FFFFFF) hacia abajo (#417490)

---

## Problemas Resueltos

### 1. Firebase Rules bloqueaban writes
Las reglas iniciales tenian `.read: false, .write: false`. Se arreglaron a `.read: true, .write: true` en modo test.

### 2. Errores de sintaxis JSX
Ediciones repetidas causaron tags sin cerrar (`</main>`, `</section>`). Siempre verificar que el build pase antes de commitear.

### 3. Logos eliminados
Los logos были слишком маленькие y no se veian bien con el fondo. Fueron removidos de todas las vistas.

### 4. Gradiente incorrecto
El gradiente azul debe empezar desde abajo (azul oscuro) hacia arriba (blanco). Configuracion en `body` de `index.css`.

---

## Dependencias Instaladas

- `react` + `react-dom`
- `react-router-dom` (v6)
- `firebase` (Realtime Database)
- `qrcode.react` (generador de QR)
- `exceljs` (exportacion Excel)
- `lucide-react` (iconos)

---

## Vercel

- **Build command:** `npx vite build`
- **Output directory:** `dist`
- **Proyecto:** `prj_6yPdJuYeJpqapKd6rVBFmVP4Odpe` (original), nuevo `acar-asistencia` con alias `acar-asistencia.vercel.app`
- **Auto-deploy:** cada push a `main` trigger deploy automatico
- **Errores comunes:**
  - `Permission denied` en vite bin → reinstalar node_modules
  - `.git/index.lock` → eliminar archivo y reintentar
  - Commits no subidos → verificar git status antes de push

---

## Scripts Disponibles

```bash
npm run dev        # Desarrollo local (localhost:5173)
npm run build      # Build produccion
npm run preview    # Preview del build
npx vercel deploy # Deploy manual via CLI
```

---

## Notas Importantes

1. **No usar `&&` en PowerShell** — usar `;` para encadenar comandos
2. **LF vs CRLF** — archivos pueden dar warnings, no afectan el build
3. **Vercel CLI** — ejecutar desde la carpeta del proyecto
4. **Realtime Database listener** — `onValue` se re-suscribe automaticamente, no necesita refresh manual
5. **Exportacion Excel** — usa ExcelJS con una hoja por materia, encabezado azul (#417490), exporta fecha y hora local Caracas
6. **Duplicate check** — verifica `nationalId + date` antes de hacer `push()`, lanza error 'DUPLICADO' si ya existe

---

## Contacto

Desarrollado para el Programa ACAR Sabatino.
Repositorio: `github.com/vianntto029/Formulario-Automatizado-de-Asistencia-Programa-ACAR`