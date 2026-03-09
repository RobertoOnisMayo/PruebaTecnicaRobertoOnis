# Balance Eléctrico REE - Prueba Técnica Fullstack

Sistema fullstack que obtiene datos en tiempo real de la API de **REE (Red Eléctrica de España)**, los almacena en PostgreSQL y los expone mediante una API REST con frontend React.

> **Nota:** En el equipo utilizado para realizar las pruebas no dispongo de permisos para instalar Docker. Por ello he añadido datos de prueba en el frontend para poder demostrar la interfaz y los gráficos sin necesidad de ejecutar el backend con base de datos. El proyecto funciona correctamente con Docker en entornos donde esté disponible.

## Checklist del reto

### Requisitos funcionales

- [x] **Backend:** NestJS (TypeScript) con ingesta periódica de datos y API REST
- [x] **Persistencia:** Base de datos SQL (PostgreSQL) para el histórico
- [x] **Frontend:** SPA en React (TypeScript) con gráficas interactivas (Recharts)
- [x] **DevOps:** Sistema contenedorizado con Docker y estrategia de testing

### Entrega

- [x] **Formato:** Repositorio público en GitHub (o privado con invitación)
- [x] **Documentación:** README con instrucciones de ejecución y decisiones de diseño

## Stack

- **Backend:** NestJS + TypeScript
- **Frontend:** React + TypeScript + Vite
- **Base de datos:** PostgreSQL
- **Gráficos:** Recharts
- **Contenedores:** Docker + Docker Compose

## Plan de pasos (explicación detallada)

### Paso 1: Levantar los servicios con Docker

**Comando:** `docker compose up --build`

Docker Compose lee el archivo `docker-compose.yml` y ejecuta tres contenedores:

- **PostgreSQL:** Base de datos que almacena el histórico del balance eléctrico. Tiene un healthcheck que comprueba cada 5 segundos si la base está lista para aceptar conexiones.
- **Backend (NestJS):** La API REST. Está configurado con `depends_on: postgres` y `condition: service_healthy`, así que no arranca hasta que PostgreSQL responde correctamente.
- **Frontend (Nginx):** Sirve la aplicación React compilada. Las peticiones a `/api/*` se redirigen al backend mediante proxy inverso.

La opción `--build` fuerza la construcción de las imágenes antes de arrancar (por si hay cambios en el código).

---

### Paso 2: Esperar a que los servicios estén listos

Cuando el backend arranca, TypeORM se conecta a PostgreSQL y, con `synchronize: true`, crea o actualiza las tablas según las entidades definidas (en este caso, `balance_records`). No hace falta ejecutar migraciones manualmente.

El frontend ya está disponible en http://localhost. Las llamadas a `/api/balance` o `/api/sync` pasan por Nginx y llegan al backend en el puerto 3000.

---

### Paso 3: Sincronizar datos desde REE

**Acción:** Pulsar el botón "Sincronizar datos REE" en el frontend.

El frontend hace un `POST /api/sync` (opcionalmente con `start_date` y `end_date` en el body). El backend:

1. Llama a la API de REE: `https://apidatos.ree.es/es/datos/balance/balance-electrico?start_date=...&end_date=...&time_trunc=day`
2. Recibe un JSON anidado (categorías → tipos → valores por fecha)
3. Lo transforma en registros planos: `{ datetime, category, type, value, percentage, color }`
4. Hace upsert en PostgreSQL usando `(datetime, category, type)` como clave única para evitar duplicados

Si no se envían fechas, se sincronizan los últimos 30 días por defecto.

---

### Paso 4: Consultar y visualizar los datos

**Acción:** Seleccionar rango de fechas y pulsar "Consultar".

1. El frontend hace `GET /api/balance?start_date=2024-01-01&end_date=2024-01-31`
2. El backend valida los parámetros (class-validator), consulta PostgreSQL y devuelve los registros
3. El frontend agrupa los datos por fecha y tipo de generación
4. Recharts dibuja un gráfico de barras apiladas: cada barra es un día, cada color un tipo (Eólica, Nuclear, Solar, etc.)

---

### Paso 5: Sincronización automática (cron)

El backend tiene un scheduler (`@Cron('0 */6 * * *')`) que cada 6 horas:

1. Calcula el rango de los últimos 7 días
2. Llama a `fetchAndStore` igual que el sync manual
3. Actualiza la base de datos sin intervención del usuario

Si la API de REE falla, el error se registra en logs pero la aplicación sigue funcionando (fallback elegante).

---

### Alternativa sin Docker (modo demo)

**Paso 1:** `cd frontend && npm run dev` — Arranca solo Vite en http://localhost:5173. No se necesita backend ni base de datos.

**Paso 2:** Pulsar "Consultar" — Si la llamada a `/api/balance` falla (por ejemplo, porque el backend no está corriendo), el frontend captura el error y usa datos de prueba generados localmente. Se muestra un aviso amarillo "Modo demo" y el gráfico se renderiza con datos ficticios para poder ver la interfaz.

## Arquitectura y Pipeline de Datos

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  API REE    │────▶│   Backend    │────▶│  PostgreSQL │◀────│   Frontend  │
│  (externo)  │     │   NestJS     │     │             │     │   React     │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │  Cron cada 6h      │  REST API          │
       │  + Sync manual     │  /api/balance      │
       └────────────────────┴────────────────────┘
```

### Modelo de datos

- **balance_records:** Almacena cada registro del balance eléctrico
  - `datetime`: Fecha/hora del dato
  - `category`: Categoría (Renovable, No-Renovable, Almacenamiento, Demanda)
  - `type`: Tipo de generación (Eólica, Nuclear, Solar, etc.)
  - `value`: Valor en MWh
  - `percentage`: Porcentaje
  - `color`: Color para gráficos

## Ejecución con Docker (producción)

```bash
docker compose up --build
```

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3000 (o vía proxy /api desde el frontend)
- **PostgreSQL:** localhost:5432

### Primera ejecución

1. Ejecutar `docker compose up --build`
2. Esperar a que los servicios estén listos
3. Sincronizar datos: desde el frontend, pulsar **"Sincronizar datos REE"** o hacer POST a `http://localhost:3000/api/sync` con body opcional:
   ```json
   { "start_date": "2024-01-01", "end_date": "2024-01-31" }
   ```
4. Seleccionar rango de fechas y pulsar **"Consultar"**

## Ejecución en desarrollo

### Backend

```bash
cd backend
npm install
# Requiere PostgreSQL en localhost:5432 (o usar docker compose solo para postgres)
docker compose up postgres -d
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend usa proxy a `http://localhost:3000` para las llamadas a `/api`.

## Tests

### Backend

```bash
cd backend
npm test          # Unit tests
npm run test:cov  # Con cobertura
npm run test:e2e  # E2E (requiere PostgreSQL)
```

### Frontend

```bash
cd frontend
npm run test:run
```

## API REST

### GET /api/balance

Obtener balance eléctrico por rango de fechas.

**Query params:**
- `start_date` (requerido): ISO date, ej. `2024-01-01`
- `end_date` (requerido): ISO date, ej. `2024-01-31`

**Ejemplo:** `GET /api/balance?start_date=2024-01-01&end_date=2024-01-31`

### POST /api/sync

Sincronizar datos desde la API de REE.

**Body (opcional):**
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-01-31",
  "time_trunc": "day"
}
```

Si no se envía body, sincroniza los últimos 30 días.

### GET /api/health

Health check del backend.

## Cómo obtener y actualizar datos de REE

1. **Automático:** El backend ejecuta un cron cada 6 horas que sincroniza los últimos 7 días.
2. **Manual:** Desde el frontend con el botón "Sincronizar datos REE" o con `POST /api/sync`.
3. **Fuente:** https://apidatos.ree.es/es/datos/balance/balance-electrico

## Variables de entorno

| Variable      | Descripción           | Default   |
|---------------|-----------------------|-----------|
| DB_HOST       | Host PostgreSQL       | localhost |
| DB_PORT       | Puerto PostgreSQL     | 5432      |
| DB_USER       | Usuario               | postgres  |
| DB_PASSWORD   | Contraseña            | postgres  |
| DB_NAME       | Nombre de BD          | ree_balance |
| PORT          | Puerto del backend    | 3000      |
| FRONTEND_URL  | URL del frontend (CORS) | http://localhost:5173 |

## Capturas

Se incluyen capturas del frontend en funcionamiento en: [`/capturas`](./capturas)

Tras ejecutar el proyecto, la interfaz muestra:
- Selector de rango de fechas
- Botón para sincronizar datos desde REE
- Gráfico de barras apiladas con la evolución del balance eléctrico por tipo de generación

## Estructura del proyecto

```
├── backend/           # NestJS API
│   ├── src/
│   │   ├── balance/   # Módulo balance, controladores, servicios
│   │   ├── ree/       # Cliente API REE
│   │   └── health/    # Health check
│   └── test/
├── frontend/          # React SPA
│   └── src/
│       ├── api/       # Cliente API
│       ├── components/
│       └── types/
├── capturas/         # Capturas del frontend en funcionamiento
├── docker-compose.yml
└── README.md
```
