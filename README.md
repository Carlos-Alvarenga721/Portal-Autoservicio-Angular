# AAP Portal – POC

Portal web para disparar automatizaciones en **Ansible Automation Platform (AAP)** vía API REST.  
Monorepo: Angular (frontend) + Node/Express (backend), pensado para correr en una sola VM (RHEL 9).

---

## Estructura

```
/frontend        → Angular 18 (standalone components, lazy routes)
/backend         → Node/Express + SQLite (better-sqlite3)
/package.json    → Scripts raíz (concurrently)
/.env.example    → Plantilla de variables (sólo backend)
```

---

## Requisitos

| Software | Versión mínima |
|----------|---------------|
| Node.js  | 18+           |
| npm      | 9+            |

> En RHEL 9 puedes instalar Node vía `dnf module enable nodejs:18 && dnf install nodejs`.

---

## Instalación rápida

```bash
# 1. Clonar el repo
git clone <url> aap-portal && cd aap-portal

# 2. Instalar dependencias raíz (concurrently)
npm install

# 3. Instalar dependencias de backend y frontend
npm run install:all

# 4. Configurar variables de entorno del backend
cp backend/.env.example backend/.env
#    → Edita backend/.env con los valores reales de AAP (ver sección abajo).

# 5. Levantar todo en modo desarrollo
npm run dev
```

Esto inicia:
- **Backend** en `http://localhost:3000` (Express + SQLite)
- **Frontend** en `http://localhost:4200` (Angular dev server, con proxy a backend)

### Scripts disponibles

| Script | Qué hace |
|--------|----------|
| `npm run dev` | Levanta backend + frontend en paralelo |
| `npm run dev:backend` | Solo backend (nodemon, hot-reload) |
| `npm run dev:frontend` | Solo frontend (ng serve + proxy) |

---

## Variables de entorno (`backend/.env`)

```env
# URL base del controlador AAP
AAP_URL=https://aap-controller.example

# Tokens de servicio – se eligen según el rol del usuario
AAP_TOKEN_AUDIT=<token para rol commercial>
AAP_TOKEN_OPS=<token para rol ops>

# IDs de Workflow Job Templates en AAP
AAP_WF_CIS_AUDIT=<id numérico>
AAP_WF_EMPLOYEE_ONBOARD=<id numérico>
AAP_WF_EPHEMERAL_PROVISION=<id numérico>
AAP_WF_EPHEMERAL_DELETE=<id numérico>

# JWT (cambiar en producción)
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=8h

# Puerto del backend
PORT=3000
```

> Los IDs de workflow y tokens se obtienen desde la UI de AAP o su API: `GET /api/v2/workflow_job_templates/`.

---

## Cómo probar

### 1. Login

Abre `http://localhost:4200/login` e ingresa uno de los usuarios precargados:

| Email | Rol |
|-------|-----|
| `comercial@empresa.com` | commercial |
| `ops@empresa.com` | ops |

El backend valida el email contra una allowlist en SQLite y devuelve un JWT.

### 2. Ejecutar un job

Navega a cualquiera de los módulos (CIS, Empleados, Efímeros), llena los campos (si aplica) y pulsa el botón de acción.

El portal enviará un `POST` al backend, que a su vez llama a la API de AAP:

```
POST /api/v2/workflow_job_templates/{id}/launch/
```

### 3. Ver resultado

Si AAP responde correctamente, verás en pantalla:

```
✅ Job lanzado — job_id: 12345
```

Si AAP no está configurado o los tokens/IDs son placeholders, recibirás un error `502` con el detalle.

---

## API del backend

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Body: `{ email }` → `{ token, email, role }` |
| GET  | `/api/auth/me` | Sí | → `{ email, role }` |
| POST | `/api/jobs/cis/audit` | Sí | Lanza auditoría CIS |
| POST | `/api/jobs/employees/create` | Sí | Body: `{ firstName, lastName, username, email, department, role, adGroups? }` |
| POST | `/api/jobs/ephemeral/create` | Sí | Body: `{ envId }` (TTL 3h fijo) |
| POST | `/api/jobs/ephemeral/delete` | Sí | Body: `{ envId }` |
| GET  | `/api/health` | No | Health-check |

Autenticación: header `Authorization: Bearer <jwt>`.

---

## Roles y permisos

| Rol | Token AAP usado | Acceso |
|-----|-----------------|--------|
| commercial | `AAP_TOKEN_AUDIT` | CIS Audit, Empleados, Efímeros |
| ops | `AAP_TOKEN_OPS` | Todo (misma UI; token con más permisos en AAP) |

La diferenciación real de permisos vive en AAP (los tokens de servicio tienen scopes diferentes).  
La UI está preparada para ocultar/deshabilitar módulos por rol en el futuro.

---

## Producción (resumen)

```bash
# Build del frontend
cd frontend && npx ng build --configuration production

# El backend sirve los estáticos de frontend/dist automáticamente
cd ../backend && NODE_ENV=production node src/index.js
```

Todo corre en un solo puerto (3000).

---

## Licencia

Uso interno / POC.
