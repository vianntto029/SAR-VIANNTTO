# Programa ACAR Sabatino - Registro de Asistencia

Sistema de registro de asistencia por codigo QR para el Programa ACAR Sabatino.

---

## Acceso

- **App:** https://acar-asistencia.vercel.app/
- **Admin:** https://acar-asistencia.vercel.app/login
- **Contrasena:** `acar2026`

---

## Campos del registro

- Nombre del joven
- Numero de Cedula (evita duplicados el mismo dia)
- Seccion / Grupo
- Nombre del representante
- Materia (fija desde el QR)

---

## Funcionalidades

- QR por materia
- Evita registro duplicado (misma cedula + misma fecha)
- Exportacion a Excel con una hoja por materia
- Panel docente con tabla en tiempo real
- Status flotante debajo de la lista del dia

---

## Paleta de colores

| Color | Hex |
|-------|-----|
| Blanco oseo | #FFFFFF |
| Gris azulado claro | #E9EEF3 |
| Gris azulado medio | #CCD9E1 |
| Azul grisaceo | #ACC2CF |
| Azul gris | #8EABC0 |
| Azul medio | #7197AE |
| Azul profundo | #5B84A1 |
| Azul oscuro | #417490 |

---

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev         # Desarrollo
npm run build       # Produccion
```

---

## Documentacion adicional

Ver `BITACORA.md` para historial completo de desarrollo, arquitectura y decisiones tecnicas.