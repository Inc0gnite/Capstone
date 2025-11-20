# 🧩 Diagrama de Componentes - Simplificado

## Sistema de Gestión de Flota PepsiCo Chile

---

## Diagrama de Componentes Principal

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
 'primaryTextColor':'#000000',
 'primaryColor':'#ffffff',
 'primaryBorderColor':'#000000'}}}%%
graph TB
    subgraph Frontend["🎨 FRONTEND (React)"]
        F["📱 UI & Estado<br/>Páginas • Componentes • Zustand • Axios"]
    end

    subgraph Backend["🎮 BACKEND (Node.js)"]
        B["⚙️ API REST<br/>Rutas • Middleware • Controladores • Servicios"]
    end

    subgraph Database["💾 BASE DE DATOS"]
        D["🗄️ PostgreSQL + Prisma<br/>Consultas SQL Seguras"]
    end

    subgraph External["☁️ SERVICIOS EXTERNOS"]
        E["🌐 Cloudinary (Imágenes)<br/>SMTP (Correos)"]
    end

    F -->|"REST API (JSON)"| B
    B -->|"SQL Queries"| D
    F -->|"Upload / Request"| E
    B -->|"Send Email"| E

    style Frontend fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style Backend fill:#E1F5FF,stroke:#1976D2,stroke-width:2px
    style Database fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style External fill:#FFE0B2,stroke:#E64A19,stroke-width:2px

```

---

## Componentes por Capa

### 🎨 Frontend (React)

- **Páginas:** Dashboard, Vehículos, Ingresos, OT, Inventario
- **Componentes:** Forms, Tables, Modals, Charts
- **Estado:** Zustand (global), React Query (servidor)
- **Cliente API:** Axios con interceptores

### 🎮 Backend (Node.js)

- **Rutas:** /api/auth, /api/vehicles, /api/entries, /api/work-orders
- **Middleware:** CORS, Helmet, JWT, RBAC, Validación
- **Controllers:** Auth, Vehicle, Entry, WorkOrder, Inventory
- **Services:** Lógica de negocio + Notificaciones

### 💾 Database (PostgreSQL)

- **ORM:** Prisma Client
- **Tablas:** 9 principales (usuarios, vehículos, órdenes, etc.)

---

**Exportar a PNG:** https://mermaid.live/
