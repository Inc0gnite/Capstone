# 🏗️ Arquitectura del Sistema - Patrón MVC

## Sistema de Gestión de Flota PepsiCo Chile

---

## Diagrama MVC Simplificado

```mermaid
%%{init: {'theme':'base', 'themeVariables': {
 'primaryTextColor':'#000000',
 'primaryColor':'#ffffff',
 'primaryBorderColor':'#000000'}}}%%
graph TB
    U["👤 USUARIO<br/>Guardia / Mecánico / Jefe"]

    subgraph V["🎨 VISTA (Frontend React)"]
        V1["Componentes UI<br/>Dashboard, Vehículos, Órdenes, Inventario"]
    end

    subgraph C["🎮 CONTROLADOR (Backend Node.js)"]
        C1["API REST<br/>Autenticación, Lógica, Rutas"]
    end

    subgraph M["💾 MODELO (PostgreSQL)"]
        M1["Tablas<br/>Usuarios, Vehículos, Órdenes, Repuestos"]
    end

    U -->|"Interacción"| V1
    V1 -->|"HTTP Request"| C1
    C1 -->|"SQL"| M1
    M1 -.->|"Datos"| C1
    C1 -.->|"JSON Response"| V1

    style V fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style C fill:#E1F5FF,stroke:#1976D2,stroke-width:2px
    style M fill:#C8E6C9,stroke:#388E3C,stroke-width:2px

```

---

## Flujo de Datos

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'primaryTextColor':'#000000', 'secondaryTextColor':'#000000', 'tertiaryTextColor':'#000000', 'textColor':'#000000', 'primaryColor':'#ffffff', 'primaryBorderColor':'#000000'}}}%%
flowchart LR
    U["👤<br/>Usuario"]
    V["🎨<br/>VISTA<br/>React"]
    C["🎮<br/>CONTROLADOR<br/>Express"]
    M["💾<br/>MODELO<br/>PostgreSQL"]
  
    U -->|"1. Acción"| V
    V -->|"2. Request"| C
    C -->|"3. Query"| M
    M -.->|"4. Datos"| C
    C -.->|"5. JSON"| V
    V -.->|"6. Render"| U
  
    style V fill:#FFF9C4,stroke:#F57F17,stroke-width:3px
    style C fill:#E1F5FF,stroke:#1976D2,stroke-width:3px
    style M fill:#C8E6C9,stroke:#388E3C,stroke-width:3px
```

---

## Tecnologías

**🎨 Vista (Frontend):**

- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand + React Query

**🎮 Controlador (Backend):**

- Node.js 20 + Express.js
- JWT + bcrypt + Zod

**💾 Modelo (Database):**

- PostgreSQL 15+
- Prisma ORM

---

**Exportar a PNG:** https://mermaid.live/
