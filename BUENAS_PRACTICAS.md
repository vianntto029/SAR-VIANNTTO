# Buenas Practicas - Proyecto ACAR Sabatino

---

## Git y Control de Versiones

### Antes de cada commit
1. Ejecutar `npm run build` para verificar que no hay errores de compilacion
2. Revisar `git status` para ver exactamente que archivos cambiaron
3. Nunca hacer commit con build fallido

### Formato de commits
```
tipo: descripcion corta

- Cambio especifico 1
- Cambio especifico 2
```

Ejemplos:
```
Fix: typo en label de contrasena
Feat: agregar exportacion a PDF
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
- Logica de estado en `src/context/AttendanceContext.jsx`
- Estilos en `src/App.css` (un solo archivo)

### Reglas JSX
1. Siempre verificar tags de cierre — errores comunes cuando se editan componentes manualmente
2. Un `return()` debe cerrar todos los tags abiertos
3. Usar `className` en vez de `class`
4. Comillas dobles para atributos JSX

### Ejemplo de estructura correcta:
```jsx
return (
  <main className="nombre-vista">
    <div className="contenedor">
      <h1>Titulo</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input type="text" required />
        </label>
        <button type="submit">Enviar</button>
      </form>
    </div>
  </main>
)
```

### Verificar build antes de push
```powershell
Set-Location "H:\ACAR"
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
2. Componentes principales (hero-panel, qr-panel, materias-panel)
3. Vistas individuales (login-view, student-view, admin-shell)
4. Estados (hover, active, disabled)
5. Animaciones (@keyframes)
6. Media queries (responsive)

### Convenciones de nombres
- `.nombre-vista` — para contenedores principales de vista
- `.nombre-componente` — para componentes reutilizables
- `.nombre-estado` — para estados (`.active`, `.danger`)
- Todo en **kebab-case** (guiones bajos, sin camelCase)

###_prioridad = important como ultimo recurso
Solo usar `!important` si es absolutamente necesario (ej: botones con override de第三方).

### Colores
- Usar variables hex directamente del paleta definida
- No inventar colores fuera de la paleta
- Verificar contraste de texto para accesibilidad

### Transiciones y animaciones
- Usar `cubic-bezier(0.16, 1, 0.3, 1)` para suavidad
- No abusar de animaciones — pueden afectar performance
- Mantener @keyframes simples y cortas

---

## Firebase Realtime Database

### Estructura de datos
```
institutos/
  ACAR/
    materias/
      -KEY: { nombre: string }
    attendance/
      -KEY: {
        name, nationalId, seccion, representante,
        subject, date, time, code, instituto
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
**IMPORTANTE:** En produccion, cambiar a reglas con autenticacion.

### Uso de listeners
- `onValue` — para datos que cambian frecuentemente (attendance, materias)
- `get` — para operaciones puntuales (checkDuplicate, resetAttendance)
- Siempre usar `async/await` con operaciones de Firebase

### Evitar duplicados
```jsx
async function checkDuplicate(nationalId, date) {
  const snapshot = await get(ref(db, `institutos/${institutoActivo}/attendance`))
  let isDuplicate = false
  snapshot.forEach(child => {
    const val = child.val()
    if (val.nationalId?.toLowerCase() === nationalId.toLowerCase() && val.date === date) {
      isDuplicate = true
    }
  })
  return isDuplicate
}
```

---

## Vercel

### Configuracion vercel.json
```json
{
  "buildCommand": "npx vite build",
  "outputDirectory": "dist"
}
```

### Deploy
- Cada push a `main` hace deploy automatico
- Para deploy manual: `npx vercel deploy --yes`
- Verificar deploy en https://vercel.com/dashboard

### Errores comunes
| Error | Solucion |
|-------|----------|
| `Command "npx vite build" exited with 1` | Ejecutar build localmente para ver error exacto |
| `Permission denied` en vite | `npm install` para reinstalar node_modules |
| `.git/index.lock` | `Remove-Item .git/index.lock -Force` |
| Commits no subidos | `git push origin main` inmediatamente despues de commit |

### Prevenir errores de deploy
1. Build local primero: `npm run build`
2. Solo si build pasa: commit + push
3. Esperar ~30s y verificar en Vercel dashboard

---

## Nomenclatura de Variables

### JavaScript
- `camelCase` para variables y funciones
- `PascalCase` para componentes React
- `SCREAMING_SNAKE_CASE` para constantes

### Ejemplos
```javascript
const ADMIN_PASSWORD = 'acar2026'  // constante
const [materias, setMaterias] = useState([])  // estado
function handleSubmit(e) { }  // handler
```

---

## Performance

### Build optimization
- No abusar de dynamic imports si no es necesario
- ExcelJS se carga dinamicamente solo cuando se necesita

### Runtime
- `useMemo` para calculos costosos
- `useCallback` para funciones pasadas como props
- No meter console.log en produccion

---

## Testing Manual Checklist

Antes de cada deploy importante, verificar:

- [ ] Login funciona con contrasena `acar2026`
- [ ] Login rechaza contrasena incorrecta
- [ ] Agregar materia se persiste en Firebase
- [ ] Materias aparecen en lista al recargar
- [ ] Seleccionar materia genera QR valido
- [ ] Registro de estudiante funciona
- [ ] Registro duplicado muestra error
- [ ] Tabla del admin se actualiza en tiempo real
- [ ] Exportar Excel genera archivo correcto
- [ ] Responsive en movil (colapsar grids)
- [ ] Estilos no se rompen en diferentes pantallas

---

## Seguridad

1. **No hardcodear claves** en codigo público (contrasena admin en constante ok para demo)
2. **Firebase rules** — en produccion usar autenticacion
3. **No mostrar errores de Firebase** directamente al usuario
4. **Vercel** — mantener project private si contiene datos sensibles

---

## Restore / Rollback

Si algo se rompe y necesita rollback:

```powershell
# Ver commits recientes
git log --oneline -10

# Volver a commit especifico
git reset --hard COMIT_HASH

# Forzar push (con cuidado!)
git push --force origin main
```

Para ver deploys anteriores en Vercel:
- Dashboard → Deployments → seleccionar deploy
- Click en "Preview" para ver estado anterior

---

## Contacto y Documentacion

- **Repo:** `github.com/vianntto029/Formulario-Automatizado-de-Asistencia-Programa-ACAR`
- **Deploy:** `https://acar-asistencia.vercel.app`
- **Bitacora:** `BITACORA.md` — historial completo de desarrollo
- **Readme:** `README.md` — guia rapida

Para preguntas sobre el codigo, revisar primero BITACORA.md para contexto historico.