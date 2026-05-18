# Buenas Prácticas - Sistema Automático de Registro Vianntto

> Guía de desarrollo para el equipo.
> Actualizada al 14 de mayo de 2026 (Iteración 1).

---

## Git y Control de Versiones

### Antes de cada commit
1. Ejecutar `npm run build` para verificar que no hay errores de compilación
2. Revisar `git status` para ver exactamente qué archivos cambiaron
3. Nunca hacer commit con build fallido

### Formato de commits
```
tipo: descripción corta

- Cambio específico 1
- Cambio específico 2
```

Ejemplos:
```
Fix: typo en label de contraseña
Feat: agregar módulo de encuestas exploratorias
Refactor: reescribir estilos del hero panel
```

### Evitar problemas comunes
- **No usar `&&` en PowerShell** — usar `;` para encadenar comandos
- **LF/CRLF warnings** — no afectan el build, ignorarlos
- **`.git/index.lock`** — eliminar si bloquea commits: `Remove-Item .git/index.lock -Force`
- **Subir commits** — siempre verificar que push completo con `git log -1`

---

## React y JSX

### Estructura de componentes
- Cada vista en `src/views/`
- Lógica de estado en `src/context/AttendanceContext.jsx`
- Estilos en `src/App.css` (un solo archivo)

### Reglas JSX
1. Siempre verificar tags de cierre — errores comunes cuando se editan componentes manualmente
2. Un `return()` debe cerrar todos los tags abiertos
3. Usar `className` en vez de `class`
4. Comillas dobles para atributos JSX

### Verificar build antes de push
```bash
npm run build
# Si pasa OK, continuar con git
git add src/
git commit -m "mensaje"
git push origin main
```

---

## CSS

### Estructura de App.css
1. Variables globales (body, font-family)
2. Componentes principales (hero-panel, qr-panel, proyectos-panel)
3. Inputs rápidos (quick-qr-section, quick-qr-field)
4. Encuesta panel (encuesta-panel, encuesta-copy)
5. Modal (modal-overlay, modal-content, modal-pregunta-row)
6. Vistas individuales (login-view, student-view, admin-shell)
7. Estados (hover, active, disabled)
8. Animaciones (@keyframes)
9. Media queries (responsive)

### Convenciones de nombres
- `.nombre-vista` — para contenedores principales de vista
- `.nombre-componente` — para componentes reutilizables
- `.nombre-estado` — para estados (`.active`, `.danger`)
- Todo en **kebab-case**

### Colores
- Usar colores hex definidos
- No inventar colores fuera de la paleta actual
- Verificar contraste de texto para accesibilidad

### Transiciones y animaciones
- Usar `cubic-bezier(0.16, 1, 0.3, 1)` para suavidad
- No abusar de animaciones — pueden afectar performance
- Mantener @keyframes simples y cortas

---

## Firebase Realtime Database

### Estructura de datos actual
```
organizaciones/
  SAR_VIANNTTO/
    proyectos/
      -KEY: { nombre: string }
    attendance/
      -KEY: {
        name, nationalId, departamento, organizacion,
        proyecto, date, time, code, orgId
      }
    encuestas/
      -KEY: {
        preguntas: [{ texto: string }],
        createdAt: string (ISO)
      }
    respuestas_encuesta/
      -KEY: {
        encuestaId, proyecto,
        respuestas: { "0": string, "1": string, ... },
        participante, date, time
      }
```

### Reglas (modo test)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
**IMPORTANTE:** En producción, cambiar a reglas con autenticación.

### Uso de listeners
- `onValue` — para datos que cambian frecuentemente (attendance, proyectos, encuestas, respuestas)
- `get` — para operaciones puntuales (checkDuplicate, resetAttendance, getEncuestaById)
- Siempre usar `async/await` con operaciones de Firebase

---

## Vercel

### Configuración vercel.json
```json
{
  "buildCommand": "npx vite build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Deploy
- Cada push a `main` hace deploy automático
- Para deploy manual: `npx vercel deploy --yes`

### Errores comunes
| Error | Solución |
|-------|----------|
| `Command "npx vite build" exited with 1` | Ejecutar build localmente para ver error exacto |
| `Permission denied` en vite | `npm install` para reinstalar node_modules |
| `.git/index.lock` | `Remove-Item .git/index.lock -Force` |

---

## Nomenclatura de Variables

### JavaScript
- `camelCase` para variables y funciones
- `PascalCase` para componentes React
- `SCREAMING_SNAKE_CASE` para constantes

### Convenciones del proyecto
```javascript
const ADMIN_PASSWORD = 'vianntto2026'        // constante
const [proyectos, setProyectos] = useState([]) // estado
const [surPreguntas, setSurPreguntas] = useState([]) // prefijo sur = survey
function handleAddProyecto(e) { }             // handler
```

### Prefijos de estado
| Prefijo | Significado | Ejemplo |
|---------|-------------|---------|
| (ninguno) | Asistencia / general | `selectedProyecto`, `quickConfirmed` |
| `sur` | Survey / encuesta | `surOrg`, `surProy`, `surEncuestaId` |
| `nuevo` | Nuevo item para agregar | `nuevoProyecto` |
| `selected` | Item seleccionado | `selectedDate`, `selectedProyecto` |

---

## Performance

### Build optimization
- ExcelJS se carga dinámicamente solo cuando se necesita (`await import('exceljs')`)
- No abusar de dynamic imports si no es necesario

### Runtime
- `useMemo` para cálculos costosos (filtros, links)
- `useCallback` para funciones pasadas como props
- No meter console.log en producción

---

## Testing Manual Checklist

Antes de cada deploy importante, verificar:

### Módulo Asistencia
- [ ] Login funciona con contraseña `vianntto2026`
- [ ] Login rechaza contraseña incorrecta
- [ ] Agregar proyecto se persiste en Firebase
- [ ] Proyectos aparecen en lista al recargar
- [ ] Seleccionar proyecto genera QR válido
- [ ] Inputs rápidos con auto-label funcionan
- [ ] Registro de participante con nuevos campos funciona
- [ ] Registro duplicado muestra error
- [ ] Tabla del admin se actualiza en tiempo real
- [ ] Exportar Excel Asistencia genera archivo correcto

### Módulo Encuestas
- [ ] Botón "Personalizar Encuesta" abre modal
- [ ] Agregar/eliminar preguntas funciona
- [ ] "Finalizar encuesta" guarda en Firebase
- [ ] Generar QR de encuesta funciona
- [ ] QR incluye proyecto en URL
- [ ] Formulario de encuesta carga preguntas dinámicas
- [ ] Envío de respuestas funciona
- [ ] Segunda tabla "Respuestas de Encuesta" se actualiza
- [ ] Exportar Excel Encuestas genera archivo correcto

### General
- [ ] Responsive en móvil (colapsar grids a 900px)
- [ ] Estilos no se rompen en diferentes pantallas
- [ ] Sin errores en consola del navegador

---

## Seguridad

1. **Contraseña admin** (`vianntto2026`) hardcodeada para demo — cambiar antes de producción real
2. **Firebase rules** — en producción usar autenticación
3. **No mostrar errores de Firebase** directamente al usuario
4. **API keys de Firebase** — visibles en frontend (es normal para Firebase, pero rotar si hay riesgo)
5. **Vercel** — mantener proyecto private si contiene datos sensibles

---

## Restore / Rollback

Si algo se rompe y necesita rollback:

```bash
# Ver commits recientes
git log --oneline -10

# Volver a commit específico
git reset --hard COMMIT_HASH

# Forzar push (con cuidado!)
git push --force origin main
```

---

## Contacto y Documentación

- **Documentación principal:** `BITACORA.md` — acta, PRD, bitácora por sesiones, roadmap
- **Guía rápida:** `README.md`
- **Repositorio:** `github.com/vianntto029/Formulario-Automatizado-de-Asistencia-Programa-ACAR` (original)

---

*Documento mantenido como parte del proyecto Sistema Automático de Registro Vianntto.*
