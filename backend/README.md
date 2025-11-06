# 🚀 Backend API - Plataforma de Gestión de Flota

API REST desarrollada con Node.js, Express y TypeScript para la gestión de ingresos de vehículos.

## 📊 Estadísticas del Backend

- **📁 Archivos:** 41 archivos TypeScript
- **📝 Líneas de Código:** ~4,600 líneas
- **🔗 Endpoints:** 80+ endpoints REST
- **🗄️ Tablas:** 20 tablas en PostgreSQL
- **🔒 Seguridad:** JWT + RBAC + Auditoría
- **📚 Documentación:** 100% documentado

## 🏗️ Arquitectura

```
Backend/
├── src/
│   ├── controllers/     # 10 controladores (1,200 líneas)
│   ├── services/        # 9 servicios (2,000 líneas)
│   ├── routes/          # 11 archivos de rutas (600 líneas)
│   ├── middlewares/     # 5 middlewares (400 líneas)
│   ├── utils/           # 4 utilidades (300 líneas)
│   └── config/          # 2 configuraciones (100 líneas)
├── prisma/
│   ├── schema.prisma    # Esquema de BD (440 líneas)
│   └── seed.ts          # Datos de prueba (280 líneas)
└── tests/               # Pruebas (próxima fase)
```

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example.txt .env

# Generar cliente Prisma
npm run db:generate

# Ejecutar migraciones
npm run db:migrate

# Iniciar servidor de desarrollo
npm run dev
```

## 📡 Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `POST /api/users` - Crear usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Vehículos
- `GET /api/vehicles` - Listar vehículos
- `GET /api/vehicles/:id` - Obtener vehículo
- `POST /api/vehicles` - Crear vehículo
- `PATCH /api/vehicles/:id` - Actualizar vehículo

### Ingresos
- `GET /api/entries` - Listar ingresos
- `GET /api/entries/:id` - Obtener ingreso
- `POST /api/entries` - Registrar ingreso
- `PATCH /api/entries/:id` - Actualizar ingreso

### Órdenes de Trabajo
- `GET /api/work-orders` - Listar OT
- `GET /api/work-orders/:id` - Obtener OT
- `POST /api/work-orders` - Crear OT
- `PATCH /api/work-orders/:id` - Actualizar OT

### Inventario
- `GET /api/spare-parts` - Listar repuestos
- `POST /api/spare-parts` - Crear repuesto
- `PATCH /api/spare-parts/:id` - Actualizar repuesto

## 🗄️ Base de Datos

El proyecto usa Prisma ORM con PostgreSQL.

### Schema
Ver archivo `prisma/schema.prisma` para el modelo completo.

### Comandos Prisma

```bash
# Generar cliente
npm run db:generate

# Crear migración
npm run db:migrate

# Deploy migraciones
npm run db:migrate:deploy

# Abrir Prisma Studio
npm run db:studio

# Push cambios sin migración
npm run db:push
```

## 🔒 Seguridad

- **JWT**: Autenticación basada en tokens
- **bcrypt**: Hash de contraseñas
- **helmet**: Headers de seguridad
- **CORS**: Configuración de orígenes
- **Rate Limiting**: Límite de peticiones

## 📝 Scripts

- `npm run dev` - Servidor desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm start` - Ejecutar build
- `npm run lint` - Ejecutar ESLint
- `npm run format` - Formatear con Prettier
- `npm test` - Ejecutar tests

## 🌐 Variables de Entorno

Ver `env.example.txt` para todas las variables necesarias.

Variables críticas:
- `DATABASE_URL` - URL de conexión PostgreSQL
- `JWT_SECRET` - Secreto para tokens JWT
- `PORT` - Puerto del servidor
- `FRONTEND_URL` - URL del frontend para CORS





