# 🎨 Frontend - Plataforma de Gestión de Flota

Aplicación web desarrollada con React, TypeScript y Vite.

## 📊 Estadísticas del Frontend

- **📁 Archivos:** 25 archivos TypeScript/TSX
- **📝 Líneas de Código:** ~2,850 líneas
- **🎨 Componentes:** 10+ componentes reutilizables
- **📱 Páginas:** 8 páginas principales
- **🎯 Dashboards:** 6 dashboards personalizados por rol
- **📚 Documentación:** 100% documentado

## 🏗️ Arquitectura

```
Frontend/
├── src/
│   ├── components/      # 10 componentes (800 líneas)
│   ├── pages/           # 8 páginas (1,500 líneas)
│   ├── services/        # 5 servicios (400 líneas)
│   ├── store/           # 1 store Zustand (100 líneas)
│   ├── hooks/           # Custom hooks (50 líneas)
│   └── utils/           # Utilidades (50 líneas)
├── public/              # Assets estáticos
└── dist/                # Build de producción
```

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example.txt .env

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en http://localhost:5173

## 📁 Estructura

```
src/
├── components/     # Componentes reutilizables
├── pages/          # Páginas/vistas de la app
├── hooks/          # Custom React hooks
├── services/       # Servicios de API
├── store/          # Estado global (Zustand)
├── utils/          # Funciones utilitarias
├── types/          # Tipos TypeScript
├── schemas/        # Esquemas de validación (Zod)
├── lib/            # Configuraciones de librerías
└── assets/         # Imágenes, iconos, etc.
```

## 🎨 Stack UI

- **TailwindCSS** - Framework de estilos
- **shadcn/ui** - Componentes accesibles
- **Lucide React** - Iconos
- **Recharts** - Gráficos

## 🔌 Integración con API

La aplicación se conecta al backend a través de Axios.

### Configuración
```env
VITE_API_URL=http://localhost:3000/api
```

### Servicios
Los servicios de API están en `src/services/`:
- `authService.ts` - Autenticación
- `userService.ts` - Gestión de usuarios
- `vehicleService.ts` - Gestión de vehículos
- etc.

## 📦 Gestión de Estado

### Estado del Servidor (React Query)
- Caché automático de datos del servidor
- Refetch inteligente
- Optimistic updates

### Estado Global (Zustand)
- Estado de autenticación
- Preferencias de usuario
- Estado de UI

## 🎯 Rutas

- `/login` - Inicio de sesión
- `/dashboard` - Panel principal
- `/ingresos` - Gestión de ingresos
- `/ordenes-trabajo` - Órdenes de trabajo
- `/inventario` - Control de inventario
- `/reportes` - Generación de reportes
- `/usuarios` - Administración de usuarios

## 🎨 Tema y Estilos

El proyecto usa los colores corporativos de PepsiCo:
- **Azul PepsiCo**: `#0057A8`
- **Rojo PepsiCo**: `#E32934`

Ver `tailwind.config.js` para configuración completa.

## 📝 Scripts

- `npm run dev` - Servidor desarrollo
- `npm run build` - Build producción
- `npm run preview` - Preview del build
- `npm run lint` - Ejecutar ESLint
- `npm run format` - Formatear código

## 🌐 Variables de Entorno

Ver `env.example.txt` para todas las variables necesarias.

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Gestión de Flota PepsiCo
```

## 🧩 Componentes Principales

### Layout
- `Header` - Barra superior
- `Sidebar` - Menú lateral
- `Footer` - Pie de página

### Formularios
- `LoginForm` - Formulario de login
- `VehicleForm` - Formulario de vehículos
- `WorkOrderForm` - Formulario de OT

### Tablas
- `VehicleTable` - Tabla de vehículos
- `WorkOrderTable` - Tabla de OT
- `InventoryTable` - Tabla de inventario

## 📱 Responsive Design

La aplicación es completamente responsive:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px





