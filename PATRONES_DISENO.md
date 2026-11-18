# Arquitectura y Patrones de Diseño — CaliTransparente

Este documento detalla los **patrones de diseño**, **principios arquitectónicos** y **patrones de integración** implementados en el proyecto **CaliTransparente** (tanto en el Backend con FastAPI y SQLAlchemy/PostgreSQL, como en el Frontend con React, TypeScript y Leaflet), explicando la justificación técnica de su elección y el beneficio directo que aportan a la plataforma.

---

## 1. Arquitectura General: Clean Architecture & Layered Architecture (Capas)

El proyecto sigue una separación estricta de responsabilidades en capas independientes para garantizar desacoplamiento, alta cohesión y testeabilidad:

```
┌────────────────────────────────────────────────────────┐
│             Presentación / API Routers                 │  (FastAPI endpoints: contracts, alerts, kpis)
├────────────────────────────────────────────────────────┤
│             Capa de Servicios / Dominio                │  (ETL Service, Socrata Service)
├────────────────────────────────────────────────────────┤
│             Capa de Acceso a Datos (Repositorios)      │  (ContractRepository, CommuneRepository)
├────────────────────────────────────────────────────────┤
│             Persistencia y Modelado ORM                │  (SQLAlchemy 2.0 Models: PostgreSQL / SQLite)
└────────────────────────────────────────────────────────┘
```

### ¿Por qué se aplicó?
- **Independencia de Frameworks y Fuentes Externas**: La lógica de negocio y las consultas de auditoría ciudadana no dependen directamente de si los datos provienen de la API de Socrata o de PostgreSQL.
- **Mantenibilidad y Escalabilidad**: Permite modificar la API de SECOP II o cambiar el motor de base de datos sin alterar los contratos REST ni la interfaz de usuario.

---

## 2. Patrones de Diseño en el Backend (FastAPI + SQLAlchemy)

### 2.1. Patrón Repository (Repositorio)
- **Implementación**: `app/repositories/contract_repo.py`, `app/repositories/commune_repo.py`.
- **Qué hace**: Media entre la capa de dominio/negocio y la capa de mapeo de datos de SQLAlchemy, encapsulando las consultas SQL complejas (`ilike`, filtros por año, paginación con `LIMIT` y `OFFSET`, agregaciones numéricas).
- **¿Por qué?**:
  - Evita dispersar sentencias ORM o SQL en los controladores/endpoints.
  - Centraliza la optimización de consultas (índices, paginación obligatoria y conversiones a DTOs).

### 2.2. Patrón Dependency Injection (Inyección de Dependencias)
- **Implementación**: `Depends(get_db)` en los endpoints de FastAPI (`contracts.py`, `alerts.py`, `communes.py`).
- **Qué hace**: FastAPI inyecta la sesión de base de datos `SessionLocal` en cada solicitud y asegura el cierre de la conexión al finalizar mediante un generador contextual (`try ... finally: db.close()`).
- **¿Por qué?**:
  - Previene fugas de conexiones en el pool de PostgreSQL.
  - Facilita pruebas unitarias mediante la sustitución del proveedor de sesiones (`dependency_overrides`).

### 2.3. Patrón Data Transfer Object (DTO) / Schema Validation
- **Implementación**: `app/schemas/contract_schema.py` con **Pydantic v2** (`ContratoResponse`, `ListaContratosResponse`, `AlertaDirectaResponse`, etc.).
- **Qué hace**: Define contratos de datos estrictos para entrada y salida. Convierte tipos heterogéneos (fechas ISO, valores monetarios en texto desde Socrata) a tipos nativos validados (`float`, `int`, `str`).
- **¿Por qué?**:
  - **Seguridad y Contrato API**: Oculta campos internos de la base de datos o de Socrata que no competen al cliente.
  - **Serialización Rápida**: Generación automática de especificación OpenAPI / Swagger (`/docs`).

### 2.4. Patrón Pipeline / ETL (Extract - Transform - Load)
- **Implementación**: `app/services/etl_service.py` (`SecopETLService`).
- **Qué hace**:
  1. **Extract**: Extrae bloques de contratos mediante SoQL desde Datos Abiertos Colombia.
  2. **Transform**: Normaliza nombres de columnas, sanitiza textos a mayúsculas, convierte cadenas numéricas a `float`, asigna la vigencia/año (`anio_firma`) y clasifica territorialmente el contrato mediante expresiones regulares (`_detectar_comuna_desde_texto`).
  3. **Load**: Ejecuta la persistencia idempotente (Upsert) en PostgreSQL vía `ContractRepository`.
- **¿Por qué?**:
  - **Desacoplamiento Operacional**: Aísla la variabilidad y las fallas de red de la API pública de Socrata de las consultas de los usuarios finales.

### 2.5. Patrón Background Tasks / Asynchronous Worker (Desacoplamiento de I/O)
- **Implementación**: `app/api/v1/endpoints/sync.py` con `BackgroundTasks` y cliente HTTP asíncrono `httpx`.
- **Qué hace**: Los procesos pesados de sincronización no bloquean el hilo HTTP principal de FastAPI; se ejecutan en segundo plano liberando de inmediato la respuesta al cliente.
- **¿Por qué?**:
  - La API responde en menos de 50 ms a los usuarios finales mientras el proceso de sincronización puede tardar varios segundos extrayendo lotes de SECOP II.

### 2.6. Patrón Fallback / Graceful Degradation
- **Implementación**: `app/db/session.py`.
- **Qué hace**: Intenta conectar al motor de producción PostgreSQL (`postgresql+psycopg2://...`). Si el entorno de desarrollo local no dispone de PostgreSQL levantado, degrada de forma transparente y segura a un archivo SQLite local (`cali_transparente.db`), manteniendo la operatividad sin crasheos.
- **¿Por qué?**:
  - Facilita la adopción y ejecución inmediata por parte de desarrolladores o entornos CI/CD sin requerir configuración previa de infraestructura pesada.

---

## 3. Patrones de Diseño en el Frontend (React + TypeScript + Tailwind)

### 3.1. Patrón Facade (Fachada) / Centralized API Client
- **Implementación**: `src/api/client.ts` y `src/api/endpoints.ts`.
- **Qué hace**: Ofrece una interfaz unificada y simple (`api.getContratos`, `api.getAlertasDirecta`, `api.getKPIs`) sobre la librería Axios, centralizando la configuración de baseURL, timeouts e interceptores de errores.
- **¿Por qué?**:
  - Ningún componente React conoce detalles de transporte HTTP (cabeceras, rutas URL relativas, manejo de códigos 5xx). Si se modifica un endpoint, solo se actualiza la fachada.

### 3.2. Patrón Container / Presentational Components (Smart & Dumb Components)
- **Implementación**:
  - **Container (Smart)**: `App.tsx`, `ContractsTable.tsx`, `RedFlagsCenter.tsx` gestionan estados (`useState`, `useCallback`), efectos de red (`useEffect`) y paginación.
  - **Presentational (Dumb)**: `KPIPanel.tsx`, `CommunePanel.tsx`, `ContractModal.tsx`, `WelcomeBanner.tsx` se concentran en la presentación visual, formato de moneda COP y propagación de eventos vía props.
- **¿Por qué?**:
  - Maximiza la reutilización de componentes, simplifica el renderizado de la UI y permite testear vistas visuales sin mockear llamadas de red en cada archivo.

### 3.3. Patrón Observer / Event-Driven UI con Leaflet
- **Implementación**: `src/components/CaliMap.tsx` y `src/components/CommunePanel.tsx`.
- **Qué hace**: El mapa de Leaflet actúa como emisor de eventos de selección espacial (`circle.on("click")`, `flyTo`). Al hacer clic sobre una comuna, se actualiza el estado global en `App.tsx`, lo que reactivamente notifica y actualiza el panel lateral `CommunePanel`.
- **¿Por qué?**:
  - Sincronización bidireccional y fluida entre la cartografía de Cali y los datos tabulares de inversión sin acoplar directamente el mapa al panel lateral.

### 3.4. Patrón Defensive Programming (Programación Defensiva)
- **Implementación**: `KPIPanel.tsx` y `utils/formatters.ts`.
- **Qué hace**: Validación estricta de límites numéricos, prevención de división por cero (`Math.max(rawTotal, contratosAuditados)`), desanidado seguro de URLs (`extraerUrlProceso`) y formateo de divisas (`Intl.NumberFormat`).
- **¿Por qué?**:
  - Corrige errores visuales críticos como el reporte `"241 / 0"` y previene que datos nulos provenientes de fuentes externas rompan el árbol de componentes de React.

---

## 4. Cuadro Resumen de Patrones y Beneficios

| Patrón | Capa | Archivos Clave | Problema que Resuelve |
| :--- | :--- | :--- | :--- |
| **Repository** | Backend | `contract_repo.py`, `commune_repo.py` | Desacopla la lógica de negocio de las consultas SQLAlchemy; centraliza índices y paginación. |
| **Dependency Injection** | Backend | `main.py`, `session.py`, `endpoints/` | Gestión limpia del ciclo de vida de sesiones a BD y facilidad de mocking. |
| **DTO / Pydantic** | Backend | `contract_schema.py` | Validación rigurosa de tipos, sanitización de datos de entrada/salida y autogeneración de OpenAPI. |
| **ETL Pipeline** | Backend | `etl_service.py` | Extracción, limpieza, geolocalización por regex y carga (Upsert) de SECOP II. |
| **Facade** | Frontend | `api/client.ts`, `api/endpoints.ts` | Simplifica el consumo HTTP para los componentes de React mediante una interfaz tipada única. |
| **Container / Presenter**| Frontend | `App.tsx`, `ContractsTable.tsx`, `KPIPanel.tsx` | Separación clara entre captura de datos con estado y renderizado visual puro. |
| **Programación Defensiva** | Frontend | `KPIPanel.tsx`, `formatters.ts` | Evita división por cero, valores `NaN` y caídas por objetos nulos o malformados. |
| **Graceful Degradation** | Backend | `session.py` | Soporte dual PostgreSQL / SQLite automático para desarrollo y despliegue sin fricción. |

