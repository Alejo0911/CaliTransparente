# 🏛️ CaliTransparente

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL%20%2B%20PostGIS-15+-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgis.net/)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Plataforma web de analítica, visualización y veeduría ciudadana para la contratación pública en Santiago de Cali.

---

## 📌 Descripción del Proyecto

**CaliTransparente** es una solución tecnológica de código abierto diseñada para transformar los datos masivos de contratación pública del **SECOP II** en un sistema inteligente de mapeo territorial, analítica presupuestal y detección automatizada de anomalías (*banderas rojas* o *red flags*) en Santiago de Cali. 

El objetivo principal es superar las barreras técnicas y la asimetría de información que enfrentan los ciudadanos, líderes comunitarios (JAL), periodistas e investigadores al auditar la inversión de los recursos públicos.

---

## 🏛️ Arquitectura de Software

El proyecto implementa una variante de **Clean Architecture (Arquitectura Limpia)** adaptada para servicios web modernos con FastAPI, priorizando la separación estricta de responsabilidades, la testabilidad del dominio y el desacoplamiento de los frameworks o bases de datos externas.

```text
               +-------------------------------------------------------+
               |                    Capa de Presentación               |
               |         (Vue 3 + Leaflet.js + Chart.js Dashboard)     |
               +---------------------------+---------------------------+
                                           |
                                           v (HTTP / RESTful JSON)
               +-------------------------------------------------------+
               |                    Capa de Aplicación                 |
               |          (FastAPI Routers / Endpoints RESTful)        |
               +---------------------------+---------------------------+
                                           |
                                           v
               +-------------------------------------------------------+
               |                     Capa de Dominio                   |
               |        (Modelos Pydantic v2 / Reglas de Red Flags)    |
               +---------------------------+---------------------------+
                                           |
                                           ^
                                           |
               +-------------------------------------------------------+
               |                Capa de Infraestructura                |
               |    (SQLAlchemy ORM / PostgreSQL + PostGIS / ETL Socrata)|
               +-------------------------------------------------------+
```

### Descripción de las Capas:
1. **Capa de Presentación (Frontend):** Desarrollada en Vue 3 y Leaflet.js. Se encarga de la interfaz gráfica, el renderizado de mapas interactivos por comunas y los paneles analíticos de inversión.
2. **Capa de Aplicación / Endpoints (`api/`):** Expone las rutas RESTful mediante FastAPI. Controla la recepción de peticiones HTTP, validación inicial y llamadas a los servicios de negocio.
3. **Capa de Dominio y Validación (`domain/` & `schemas/`):** Contiene la lógica de negocio pura, reglas para la detección de *banderas rojas* (*red flags*) y esquemas de validación estrictos con Pydantic v2.
4. **Capa de Infraestructura y Datos (`repositories/` & `services/`):** Gestiona la persistencia de datos relacionales y espaciales en PostgreSQL + PostGIS, así como la ejecución del pipeline ETL que procesa los datos abiertos del SECOP II.

---

## 📂 Estructura del Proyecto

El repositorio se organiza de forma modular para facilitar el mantenimiento y la escalabilidad del sistema:

```text
calitrasparente/
├── app/                        # Paquete principal del Backend (FastAPI)
│   ├── api/                    # Controladores y rutas RESTful por versión
│   │   └── v1/
│   │       ├── routers/        # Endpoints de contratos, comunas y alertas
│   │       └── api.py          # Enrutador central
│   ├── core/                   # Configuración global, variables de entorno y seguridad
│   │   ├── config.py
│   │   └── security.py
│   ├── db/                     # Conexión a base de datos y migraciones (Alembic)
│   │   ├── base.py
│   │   └── session.py
│   ├── domain/                 # Reglas de negocio puras y algoritmos de Red Flags
│   │   └── red_flags.py
│   ├── repositories/           # Capa de acceso a datos y consultas espaciales (PostGIS)
│   │   ├── contract_repo.py
│   │   └── commune_repo.py
│   ├── schemas/                # Esquemas de validación y serialización (Pydantic v2)
│   │   ├── contract_schema.py
│   │   └── commune_schema.py
│   ├── services/               # Pipeline ETL y lógica de casos de uso
│   │   ├── etl_service.py
│   │   └── metrics_service.py
│   └── main.py                 # Punto de entrada de la aplicación FastAPI
│
├── frontend/                   # Aplicación de Interfaz de Usuario (Vue 3 + TypeScript)
│   ├── src/
│   │   ├── api/                # Clientes HTTP (Axios)
│   │   ├── components/         # Componentes reutilizables (Mapas Leaflet, Charts, UI)
│   │   ├── router/             # Configuración de navegación
│   │   ├── store/              # Gestión de estado global (Pinia)
│   │   ├── types/              # Interfaces tipadas de TypeScript
│   │   └── views/              # Vistas y páginas principales
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
├── README.md
└── requirements.txt
```

---

## 🛠️ Tecnologías Utilizadas

### Backend & Data Science
- **Lenguaje:** Python 3.11+
- **Framework Web:** FastAPI (Alto rendimiento asíncrono y documentación OpenAPI/Swagger automática)
- **Procesamiento de Datos:** Pandas, Requests
- **Validación:** Pydantic v2

### Base de Datos & GIS
- **Motor Relacional:** PostgreSQL 15+
- **Extensión Espacial:** PostGIS (Gestión de polígonos y consultas espaciales por comunas)
- **Migraciones:** Alembic

### Frontend
- **Framework:** Vue 3 (Composition API con `<script setup>`)
- **Lenguaje:** TypeScript
- **Visualización de Mapas:** Leaflet.js
- **Estilos:** Tailwind CSS

---

## 🚀 Guía de Puesta en Marcha (Desarrollo Local)

### Prerrequisitos
- Python 3.11 o superior
- Node.js 18+ y npm/pnpm
- PostgreSQL 15+ con la extensión **PostGIS** habilitada

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/calitrasparente.git
cd calitrasparente
```

### 2. Configuración del Backend
```bash
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt
```

Crea un archivo `.env` en la raíz del proyecto:
```env
PROJECT_NAME="CaliTransparente API"
DATABASE_URL=postgresql+psycopg2://usuario:password@localhost:5432/calitrasparente_db
API_SECOP_URL=https://www.datos.gov.co/resource/mhsj-fauv.json
```

Ejecuta el servidor de desarrollo del backend:
```bash
uvicorn app.main:app --reload
```
* Documentación Swagger: `http://127.0.0.1:8000/docs`

### 3. Configuración del Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 Licencia

Este proyecto se desarrolla en el marco de la ingeniería de software y la investigación aplicada para el fortalecimiento institucional, la transparencia y la veeduría ciudadana en Santiago de Cali.