# Sistema Automático de Registro Vianntto

Sistema de registro por código QR con panel de administración en tiempo real.

---

## Acceso

- **App:** Pendiente (nuevo proyecto Firebase)
- **Admin:** Pendiente (nuevo proyecto Firebase)/login
- **Contraseña:** `vianntto2026`

---

## Campos del registro

- Nombre
- Cédula (evita duplicados el mismo día)
- Departamento al que pertenece
- Organización a la que pertenece
- Proyecto (fijo desde el QR)

---

## Funcionalidades

- QR por proyecto
- Evita registro duplicado (misma cédula + misma fecha)
- Exportación a Excel con una hoja por proyecto
- Panel facilitador con tabla en tiempo real
- Estado flotante debajo de la lista del día

---

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Desarrollo
npm run build        # Producción
```

---

## Documentación adicional

Ver `BITACORA.md` para historial completo de desarrollo, arquitectura y decisiones técnicas.
