# 👨‍💻 Manual de Desarrollo - PepsiCo Fleet Management

## 📋 Tabla de Contenidos

1. [Setup del Entorno de Desarrollo](#setup-del-entorno)
2. [Flujo de Trabajo con Git](#flujo-git)
3. [Estándares de Código](#estándares)
4. [Testing](#testing)
5. [Debugging](#debugging)
6. [Mejores Prácticas](#mejores-prácticas)

---

## 1. Setup del Entorno de Desarrollo

### 1.1 Requisitos

**Software necesario:**
- Node.js 20+ LTS
- PostgreSQL 15+ (o cuenta en Neon/Supabase)
- Git 2.40+
- VS Code (recomendado)

**Extensiones VS Code recomendadas:**
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- GitLens
- Thunder Client (testing de API)

### 1.2 Configuración Inicial

```bash
# 1. Clonar repositorio
git clone <url-del-repo>
cd Capstone_github

# 2. Instalar dependencias del monorepo
npm install

# 3. Configurar backend
cd backend
cp env.example.txt .env
# Editar .env con tu DATABASE_URL

# 4. Configurar frontend
cd ../frontend
cp env.example.txt .env
# Editar si es necesario

# 5. Setup de base de datos
cd ../backend
npm run db:generate
npm run db:push
npm run db:seed

# 6. Verificar instalación
npm run dev  # En backend
cd ../frontend && npm run dev  # En frontend
```

### 1.3 Variables de Entorno

**Backend (.env):**
```env
# Base de datos
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# Servidor
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET="cambiar-en-produccion-por-algo-muy-seguro-y-largo"
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# Logging (opcional)
LOG_LEVEL=info

# Email (opcional para desarrollo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Cloudinary (opcional para imágenes)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Gestión de Flota PepsiCo
```

---

## 2. Flujo de Trabajo con Git

### 2.1 Branching Strategy

**Git Flow simplificado:**

```
main (producción)
  ├── develop (desarrollo)
  │   ├── feature/auth-module
  │   ├── feature/vehicle-crud
  │   ├── feature/work-orders
  │   └── bugfix/login-error
  └── hotfix/critical-bug
```

### 2.2 Nomenclatura de Branches

```bash
# Features
feature/descripcion-breve

# Bugfixes
bugfix/descripcion-del-bug

# Hotfixes
hotfix/descripcion-urgente

# Releases
release/v1.0.0
```

### 2.3 Commits Semánticos

**Formato:**
```
tipo(alcance): descripción breve

Descripción detallada (opcional)

Refs: #123
```

**Tipos:**
- `feat` - Nueva funcionalidad
- `fix` - Corrección de bug
- `docs` - Cambios en documentación
- `style` - Formato, lint (sin cambios de código)
- `refactor` - Refactorización de código
- `test` - Agregar o modificar tests
- `chore` - Tareas de mantenimiento

**Ejemplos:**
```bash
git commit -m "feat(auth): implementar login con JWT"
git commit -m "fix(vehicles): corregir validación de patente"
git commit -m "docs(api): actualizar documentación de endpoints"
git commit -m "refactor(services): extraer lógica común a utils"
```

### 2.4 Pull Request

**Checklist antes de hacer PR:**

- [ ] Código compila sin errores
- [ ] Pasa todos los tests
- [ ] Pasa el linter (`npm run lint`)
- [ ] Está documentado
- [ ] Se probó manualmente
- [ ] No hay console.log olvidados
- [ ] Variables de entorno documentadas

**Template de PR:**

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Nueva funcionalidad
- [ ] Corrección de bug
- [ ] Refactorización
- [ ] Documentación

## Testing
- [ ] Tests unitarios agregados/actualizados
- [ ] Tests de integración agregados/actualizados
- [ ] Probado manualmente

## Screenshots (si aplica)
[Agregar capturas de pantalla]

## Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He comentado el código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
```

---

## 3. Estándares de Código

### 3.1 TypeScript

**Configuración estricta:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Siempre tipar explícitamente:**

```typescript
// ✅ Correcto
async function getUser(id: string): Promise<User> {
  return await prisma.user.findUnique({ where: { id } })
}

// ❌ Incorrecto
async function getUser(id) {
  return await prisma.user.findUnique({ where: { id } })
}
```

### 3.2 ESLint

**Configuración:**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

**Ejecutar:**
```bash
npm run lint          # Ver errores
npm run lint:fix      # Corregir automáticamente
```

### 3.3 Prettier

**Configuración:**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 90,
  "arrowParens": "always"
}
```

**Ejecutar:**
```bash
npm run format        # Formatear código
```

### 3.4 Estructura de Componentes React

```typescript
// Imports
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MyService } from '../services'

// Types
interface MyComponentProps {
  title: string
  onAction?: () => void
}

// Component
export default function MyComponent({ title, onAction }: MyComponentProps) {
  // Hooks de estado
  const [data, setData] = useState<MyType[]>([])
  const [loading, setLoading] = useState(false)
  
  // Hooks de routing/store
  const navigate = useNavigate()
  
  // Effects
  useEffect(() => {
    loadData()
  }, [])
  
  // Handlers
  const loadData = async () => {
    setLoading(true)
    try {
      const result = await MyService.getData()
      setData(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleClick = () => {
    onAction?.()
  }
  
  // Render
  if (loading) return <Loading />
  
  return (
    <div className="container">
      <h1>{title}</h1>
      {data.map(item => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
```

### 3.5 Estructura de Services

```typescript
// services/myService.ts
import prisma from '../config/database'

export class MyService {
  /**
   * Obtener todos los registros
   */
  async getAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit
    
    const [items, total] = await Promise.all([
      prisma.myTable.findMany({ skip, take: limit }),
      prisma.myTable.count()
    ])
    
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
  
  /**
   * Obtener por ID
   */
  async getById(id: string) {
    const item = await prisma.myTable.findUnique({
      where: { id },
      include: { relatedTable: true }
    })
    
    if (!item) {
      throw new Error('Item no encontrado')
    }
    
    return item
  }
  
  /**
   * Crear nuevo registro
   */
  async create(data: CreateData) {
    // Validaciones
    const existing = await prisma.myTable.findFirst({
      where: { uniqueField: data.uniqueField }
    })
    
    if (existing) {
      throw new Error('Ya existe un registro con ese valor')
    }
    
    // Crear
    const item = await prisma.myTable.create({ data })
    return item
  }
}

export default new MyService()
```

---

## 4. Testing

### 4.1 Configuración de Jest

```typescript
// jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ]
}
```

### 4.2 Tests Unitarios

```typescript
// tests/services/authService.test.ts
import authService from '../../src/services/authService'
import prisma from '../../src/config/database'

describe('AuthService', () => {
  beforeEach(async () => {
    await prisma.user.deleteMany()
  })
  
  describe('login', () => {
    test('should return tokens on valid credentials', async () => {
      // Arrange
      await prisma.user.create({ ... })
      
      // Act
      const result = await authService.login({
        email: 'test@test.com',
        password: 'password123'
      })
      
      // Assert
      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(result.user.email).toBe('test@test.com')
    })
    
    test('should throw error on invalid credentials', async () => {
      // Act & Assert
      await expect(
        authService.login({
          email: 'test@test.com',
          password: 'wrong'
        })
      ).rejects.toThrow('Credenciales inválidas')
    })
  })
})
```

### 4.3 Tests de Integración

```typescript
// tests/integration/auth.test.ts
import request from 'supertest'
import app from '../../src/index'

describe('POST /api/auth/login', () => {
  test('should return 200 with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@pepsico.cl',
        password: 'admin123'
      })
    
    expect(response.status).toBe(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.accessToken).toBeDefined()
  })
  
  test('should return 401 with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@pepsico.cl',
        password: 'wrong'
      })
    
    expect(response.status).toBe(401)
    expect(response.body.success).toBe(false)
  })
})
```

### 4.4 Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en watch mode
npm test -- --watch

# Tests con coverage
npm test -- --coverage

# Test específico
npm test -- authService.test.ts
```

---

## 5. Debugging

### 5.1 Backend Debug

**VS Code launch.json:**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/index.ts",
      "preLaunchTask": "npm: dev",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

**Breakpoints en código:**

```typescript
async function myFunction() {
  debugger  // El debugger se detendrá aquí
  const result = await someAsyncOperation()
  console.log('Result:', result)  // Log para debug
  return result
}
```

### 5.2 Frontend Debug

**React DevTools:**
- Instalar extensión en Chrome/Firefox
- Ver componentes, props, state
- Profiler para performance

**Redux DevTools (Zustand):**
```typescript
import { devtools } from 'zustand/middleware'

export const useStore = create(
  devtools((set) => ({
    // state...
  }))
)
```

**Console logs útiles:**

```typescript
// Estado actual del store
console.log('Auth state:', useAuthStore.getState())

// Props del componente
console.log('Props:', JSON.stringify(props, null, 2))

// Network requests
// Ver en la tab Network del browser
```

### 5.3 Database Debug

**Prisma Studio:**
```bash
cd backend
npm run db:studio
# Abre en http://localhost:5555
```

**Logs de Prisma:**
```typescript
// Habilitar logs de queries
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

**Ver queries generadas:**
```typescript
const result = await prisma.user.findMany()
// En consola verás: SELECT * FROM users
```

---

## 6. Mejores Prácticas

### 6.1 Backend

#### ✅ DO

**Usar transacciones para operaciones múltiples:**
```typescript
await prisma.$transaction(async (tx) => {
  await tx.table1.create({ ... })
  await tx.table2.update({ ... })
})
```

**Validar datos antes de guardar:**
```typescript
if (!validateRUT(rut)) {
  throw new Error('RUT inválido')
}
```

**Usar try-catch en controladores:**
```typescript
async myController(req, res) {
  try {
    const result = await myService.doSomething()
    return sendSuccess(res, result)
  } catch (error: any) {
    return sendError(res, error.message)
  }
}
```

**Remover datos sensibles de responses:**
```typescript
const { password, ...userWithoutPassword } = user
return userWithoutPassword
```

#### ❌ DON'T

**No hacer SELECT * innecesariamente:**
```typescript
// ❌ Malo
const users = await prisma.user.findMany()

// ✅ Bueno
const users = await prisma.user.findMany({
  select: { id: true, firstName: true, email: true }
})
```

**No exponer errores detallados en producción:**
```typescript
// ❌ Malo
return res.status(500).json({ error: error.stack })

// ✅ Bueno
const message = NODE_ENV === 'development' 
  ? error.message 
  : 'Error interno del servidor'
return res.status(500).json({ error: message })
```

**No guardar contraseñas en texto plano:**
```typescript
// ❌ Malo
await prisma.user.create({ password: req.body.password })

// ✅ Bueno
const hashedPassword = await hashPassword(req.body.password)
await prisma.user.create({ password: hashedPassword })
```

### 6.2 Frontend

#### ✅ DO

**Usar componentes pequeños y reutilizables:**
```typescript
// ✅ Bueno - Componentes separados
<UserCard user={user} onEdit={handleEdit} />

// ❌ Malo - Todo en un componente gigante
<div>
  {users.map(user => (
    <div>{/* 50 líneas de HTML */}</div>
  ))}
</div>
```

**Manejar estados de loading y error:**
```typescript
if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
return <DataDisplay data={data} />
```

**Usar custom hooks para lógica reutilizable:**
```typescript
function useVehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  
  const loadVehicles = async () => {
    setLoading(true)
    const data = await vehicleService.getAll()
    setVehicles(data)
    setLoading(false)
  }
  
  return { vehicles, loading, loadVehicles }
}
```

#### ❌ DON'T

**No hacer fetch en useEffect sin cleanup:**
```typescript
// ❌ Malo
useEffect(() => {
  fetch('/api/data').then(...)
}, [])

// ✅ Bueno
useEffect(() => {
  let cancelled = false
  
  fetch('/api/data').then(data => {
    if (!cancelled) setData(data)
  })
  
  return () => { cancelled = true }
}, [])
```

**No mutar state directamente:**
```typescript
// ❌ Malo
state.items.push(newItem)

// ✅ Bueno
setState({ ...state, items: [...state.items, newItem] })
```

### 6.3 Prisma

#### ✅ DO

**Usar include para eager loading:**
```typescript
// ✅ Bueno - Una query
const user = await prisma.user.findUnique({
  where: { id },
  include: { role: true, workshop: true }
})

// ❌ Malo - Múltiples queries (N+1)
const user = await prisma.user.findUnique({ where: { id } })
const role = await prisma.role.findUnique({ where: { id: user.roleId } })
```

**Usar select para limitar campos:**
```typescript
const users = await prisma.user.findMany({
  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: {
      select: { name: true }
    }
  }
})
```

**Usar transacciones para atomicidad:**
```typescript
const result = await prisma.$transaction([
  prisma.table1.create({ ... }),
  prisma.table2.update({ ... }),
  prisma.table3.delete({ ... })
])
```

---

## 7. Agregar Nueva Funcionalidad

### 7.1 Flujo Completo

**Ejemplo: Agregar módulo de "Mantenimientos Programados"**

#### Paso 1: Base de Datos

```prisma
// prisma/schema.prisma
model ScheduledMaintenance {
  id          String   @id @default(uuid())
  vehicleId   String
  maintenanceType String
  scheduledDate DateTime
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  vehicle     Vehicle  @relation(fields: [vehicleId], references: [id])
  
  @@map("scheduled_maintenances")
}
```

```bash
npx prisma migrate dev --name add_scheduled_maintenance
```

#### Paso 2: Backend Service

```typescript
// services/scheduledMaintenanceService.ts
export class ScheduledMaintenanceService {
  async getAll(vehicleId?: string) {
    const where = vehicleId ? { vehicleId } : {}
    return await prisma.scheduledMaintenance.findMany({ where })
  }
  
  async create(data: CreateMaintenanceData) {
    return await prisma.scheduledMaintenance.create({ data })
  }
}

export default new ScheduledMaintenanceService()
```

#### Paso 3: Backend Controller

```typescript
// controllers/scheduledMaintenanceController.ts
export class ScheduledMaintenanceController {
  async getAll(req: Request, res: Response) {
    try {
      const { vehicleId } = req.query
      const items = await scheduledMaintenanceService.getAll(vehicleId)
      return sendSuccess(res, items)
    } catch (error: any) {
      return sendError(res, error.message)
    }
  }
  
  async create(req: Request, res: Response) {
    try {
      const item = await scheduledMaintenanceService.create(req.body)
      return sendSuccess(res, item, 'Creado exitosamente', 201)
    } catch (error: any) {
      return sendError(res, error.message, 400)
    }
  }
}

export default new ScheduledMaintenanceController()
```

#### Paso 4: Backend Routes

```typescript
// routes/scheduledMaintenanceRoutes.ts
import { Router } from 'express'
import controller from '../controllers/scheduledMaintenanceController'
import { authenticate } from '../middlewares/auth'
import { authorize } from '../middlewares/rbac'

const router = Router()

router.use(authenticate)

router.get('/', authorize('maintenances', 'read'), controller.getAll)
router.post('/', authorize('maintenances', 'create'), controller.create)

export default router
```

#### Paso 5: Registrar en Router Principal

```typescript
// routes/index.ts
import maintenanceRoutes from './scheduledMaintenanceRoutes'

router.use('/scheduled-maintenances', maintenanceRoutes)
```

#### Paso 6: Frontend Service

```typescript
// services/maintenanceService.ts
export const maintenanceService = {
  async getAll(vehicleId?: string) {
    const params = vehicleId ? { vehicleId } : {}
    const response = await api.get('/scheduled-maintenances', { params })
    return response.data.data
  },
  
  async create(data: CreateMaintenanceData) {
    const response = await api.post('/scheduled-maintenances', data)
    return response.data.data
  }
}
```

#### Paso 7: Frontend Component

```typescript
// pages/ScheduledMaintenances.tsx
export default function ScheduledMaintenances() {
  const [items, setItems] = useState([])
  
  useEffect(() => {
    loadItems()
  }, [])
  
  const loadItems = async () => {
    const data = await maintenanceService.getAll()
    setItems(data)
  }
  
  return (
    <MainLayout>
      <h1>Mantenimientos Programados</h1>
      {items.map(item => (
        <MaintenanceCard key={item.id} item={item} />
      ))}
    </MainLayout>
  )
}
```

#### Paso 8: Agregar Ruta

```typescript
// App.tsx
<Route 
  path="/scheduled-maintenances" 
  element={
    <PrivateRoute>
      <ScheduledMaintenances />
    </PrivateRoute>
  } 
/>
```

### 7.2 Checklist

- [ ] Modelo de datos creado en Prisma
- [ ] Migración aplicada
- [ ] Service implementado
- [ ] Controller implementado
- [ ] Routes configuradas
- [ ] Middlewares aplicados
- [ ] Frontend service creado
- [ ] Componentes de UI creados
- [ ] Rutas de frontend agregadas
- [ ] Tests escritos
- [ ] Documentación actualizada

---

## 8. Comandos Útiles

### 8.1 Desarrollo

```bash
# Backend
cd backend
npm run dev              # Servidor con hot reload
npm run build            # Compilar TypeScript
npm start                # Ejecutar build
npm run lint             # Verificar código
npm run format           # Formatear código

# Frontend
cd frontend
npm run dev              # Dev server con HMR
npm run build            # Build para producción
npm run preview          # Preview del build
npm run lint             # ESLint

# Database
cd backend
npm run db:generate      # Generar cliente Prisma
npm run db:push          # Push schema sin migración
npm run db:migrate       # Crear y aplicar migración
npm run db:seed          # Poblar datos de prueba
npm run db:studio        # Abrir Prisma Studio
npm run db:reset         # ⚠️ Reset completo (borra datos)
```

### 8.2 Git

```bash
# Crear branch
git checkout -b feature/mi-nueva-feature

# Commits
git add .
git commit -m "feat(modulo): descripción"

# Push
git push origin feature/mi-nueva-feature

# Actualizar desde develop
git checkout develop
git pull
git checkout feature/mi-nueva-feature
git merge develop

# Squash commits (antes de PR)
git rebase -i HEAD~3
```

### 8.3 Troubleshooting

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install

# Regenerar Prisma
npm run db:generate

# Ver qué está usando el puerto
netstat -ano | findstr :3000    # Windows
lsof -i :3000                    # Mac/Linux

# Limpiar build
rm -rf dist
npm run build
```

---

## 9. Code Review Checklist

### Para el Autor

- [ ] El código compila sin errores ni warnings
- [ ] Agregué tests para la nueva funcionalidad
- [ ] Actualicé la documentación relevante
- [ ] El código sigue las convenciones del proyecto
- [ ] Probé los cambios manualmente
- [ ] No hay console.logs o debuggers olvidados
- [ ] Los commits son claros y descriptivos
- [ ] La PR tiene descripción detallada

### Para el Reviewer

- [ ] El código es legible y mantenible
- [ ] Las funciones hacen una sola cosa
- [ ] Los nombres de variables/funciones son descriptivos
- [ ] Hay manejo de errores apropiado
- [ ] No hay código duplicado
- [ ] Las validaciones son suficientes
- [ ] Los tests cubren casos edge
- [ ] No hay vulnerabilidades de seguridad obvias

---

## 10. Recursos

### 10.1 Documentación Oficial

- **Node.js**: https://nodejs.org/docs
- **Express**: https://expressjs.com
- **Prisma**: https://prisma.io/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **TailwindCSS**: https://tailwindcss.com/docs
- **Vite**: https://vitejs.dev

### 10.2 Herramientas

- **Postman**: https://postman.com
- **Insomnia**: https://insomnia.rest
- **TablePlus**: https://tableplus.com (GUI para PostgreSQL)
- **Prisma Studio**: Incluido con Prisma

### 10.3 Learning Resources

- **TypeScript Deep Dive**: https://basarat.gitbook.io/typescript
- **React Patterns**: https://reactpatterns.com
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## 11. Contacto

### Equipo de Desarrollo

- **Joaquín Marín** - Frontend Lead
  - Email: jo.marinm@duocuc.cl
  - GitHub: @joaquin-marin

- **Benjamin Vilches** - Backend Lead
  - Email: benj.vilches@duocuc.cl
  - GitHub: @benjamin-vilches

### Stakeholders

- **Alexis González** - Patrocinador (PepsiCo)
- **Fabián Álvarez** - Docente Supervisor (Duoc UC)

---

**Última actualización:** Octubre 15, 2024  
**Versión:** 1.0.0


