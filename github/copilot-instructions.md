Rol del agente: Eres un ingeniero senior full-stack. Tu objetivo es generar un MVP compilable (base) de un portal Self-Service que corre en una sola VM (RHEL 9) y dispara automatizaciones en Red Hat Ansible Automation Platform (AAP) vía API REST. La UI es mínima; lo importante es la integración con AAP y una estructura limpia/extensible. Este portal existe para evidenciar la automatización “one-click” y reducir tareas manuales, con casos de uso: CIS audit, gestión de empleados, entornos efímeros

0) Restricciones (no negocies)

Monorepo (un solo repo) con:

/frontend (Angular)

/backend (Node/Express)

/README.md

/.env.example (solo backend)

/.gitignore

Debe correr local y en RHEL 9 con Node LTS.

No implementes OIDC real, ni dashboards complejos, ni polling de estado.

El navegador nunca debe hablar con AAP directamente; solo el backend.

1) Arquitectura mínima del repo (generar todo el código)

Root

package.json raíz con scripts:

npm run dev → levanta frontend + backend en paralelo

npm run dev:backend

npm run dev:frontend

Usa concurrently y configura proxy (Angular → backend).

Backend (Node/Express)

Estructura sugerida:

/backend/src/index.js (bootstrap)

/backend/src/routes/*

/backend/src/middleware/auth.js

/backend/src/services/aap.js (cliente AAP)

/backend/src/db/* (allowlist users)

/backend/src/config/*

DB allowlist simple y ordenada: elige SQLite (preferido) o JSON (si lo haces, incluye locking básico y validaciones).

Seed con 2 usuarios:

comercial@empresa.com → commercial

ops@empresa.com → ops

Frontend (Angular)

Estructura mínima con Router, guard básico, servicios:

AuthService: login(), me(), logout()

JobsService: cisAudit(), employeeCreate(), ephemeralCreate(), ephemeralDelete()

UI simple (Angular Material o CSS simple; elige una y no mezcles)

2) Requerimientos funcionales (MVP exacto)
A) Login (POC)

Pantalla /login:

input email + botón “Entrar”

Backend:

valida email contra allowlist (active=true)

devuelve sesión con { email, role }

B) Autorización / Sesión

Elige JWT (recomendado) o cookie session, pero:

no guardes secretos en frontend

middleware auth obligatorio en /api/jobs/*

Política:

commercial puede ejecutar solo CIS audit (y lo que definas como “no sensible”)

ops puede ejecutar todo

Si commercial intenta endpoints no permitidos: 403

C) Dashboard

/dashboard con 3 tarjetas:

Seguridad CIS (Audit) → /cis

Gestión Empleados (Alta) → /employees

Entornos Efímeros (Crear/Eliminar) → /ephemeral

Estructura para ocultar/deshabilitar acciones por rol (aunque sea simple).

D) Formularios mínimos

CIS Audit

Botón “Ejecutar Auditoría”

Mostrar resultado: job_id

Empleados (Alta AD + Linux)

Campos: firstName, lastName, username, email, department, role

Opcional: adGroups string

Botón “Crear”

Mostrar resultado: job_id

Efímeros

Campo: envId

Acciones: Crear / Eliminar

TTL fijo 3 horas, no editable en UI (se envía como extra_vars o se maneja en workflow)

Mostrar resultado: job_id

E) Sin evidencia/polling

No listar jobs, no logs, no status.

Solo request + job_id o error.

3) Backend API (endpoints obligatorios)

Implementa exactamente estos endpoints:

POST /api/auth/login body { email }

GET /api/auth/me → { email, role }

POST /api/auth/logout (si aplica)

Jobs:

POST /api/jobs/cis/audit

POST /api/jobs/employees/create

POST /api/jobs/ephemeral/create

POST /api/jobs/ephemeral/delete

4) Integración AAP (núcleo del MVP)

Variables .env (crear .env.example):

AAP_URL=https://aap-controller.example

AAP_TOKEN_AUDIT=REPLACE_ME

AAP_TOKEN_OPS=REPLACE_ME

AAP_WF_CIS_AUDIT=REPLACE_ME

AAP_WF_EMPLOYEE_ONBOARD=REPLACE_ME

AAP_WF_EPHEMERAL_PROVISION=REPLACE_ME

AAP_WF_EPHEMERAL_DELETE=REPLACE_ME

No adivines IDs reales. Usa placeholders y documenta cómo obtenerlos.

Selección de token por rol:

commercial → AAP_TOKEN_AUDIT

ops → AAP_TOKEN_OPS

Implementa una función genérica y reutilizable:

launchAapWorkflow(workflowTemplateIdOrUrl, extraVars, token)

Requisitos de implementación:

Llamar a AAP vía REST para lanzar un workflow job template (endpoint de launch).

Enviar extra_vars según cada formulario.

Parsear respuesta y devolver { job_id } (el id que devuelve AAP).

Manejar errores:

401/403 de AAP → devolver 502/500 con mensaje claro (sin filtrar token)

timeouts con retry mínimo (1) opcional

5) Reglas de calidad (importantes)

Código compilable y ejecutable desde cero.

Validación básica de inputs (backend) y mensajes de error.

Logging mínimo en backend (sin secretos).

helmet, cors bien definido (CORS solo para frontend local), rate limit simple opcional.

Nada de credenciales en el repo. .env solo de ejemplo.

6) README (obligatorio)

Incluye:

Requisitos (Node/NPM)

Instalación:

npm install en root

copiar .env.example → .env en /backend

npm run dev

URLs:

frontend

backend healthcheck (si agregas /health)

Cómo probar:

login con comercial@empresa.com y ejecutar CIS audit

login con ops@empresa.com y ejecutar employee create / ephemeral create/delete

Dónde colocar AAP_URL, tokens y workflow IDs.

7) Entregable final

Genera:

Todo el árbol de archivos

Todo el código fuente

README completo

.env.example

Seeds de usuarios

No hagas features extra (polling, estado, reportes). El objetivo es base sólida y extensible para luego añadir evidencias, reportes HTML/email, etc.
