import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Importar rutas y middlewares
import routes from '../src/routes'
import { errorHandler, notFoundHandler } from '../src/middlewares/errorHandler'

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares de seguridad
app.use(helmet())

// CORS robusto basado en lista blanca
const defaultAllowedOrigins = [
  process.env.FRONTEND_URL || '',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean)

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .concat(defaultAllowedOrigins)

const allowAllOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .includes('*')

const corsOptions: cors.CorsOptions = {
  origin: allowAllOrigins
    ? true
    : (origin, callback) => {
        if (!origin) return callback(null, true) // permitir herramientas como curl/postman
        if (allowedOrigins.includes(origin)) return callback(null, true)
        return callback(new Error(`CORS bloqueado para origen: ${origin}`))
      },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// Rate limiting - más permisivo en desarrollo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Más permisivo en desarrollo
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
  skip: () => {
    // En desarrollo, permitir más requests
    return process.env.NODE_ENV === 'development'
  }
})
app.use('/api', limiter)

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    message: 'API de Gestión de Flota PepsiCo',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  })
})

// Root info
app.get('/', (_req, res) => {
  res.json({
    message: 'API REST - Plataforma de Gestión de Ingreso de Vehículos',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
    },
  })
})

// API info
app.get('/api', (_req, res) => {
  res.json({
    message: 'API REST - Plataforma de Gestión de Ingreso de Vehículos',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      vehicles: '/api/vehicles',
      workOrders: '/api/work-orders',
      spareParts: '/api/spare-parts',
      workshops: '/api/workshops',
      dashboard: '/api/dashboard',
    },
  })
})

// Rutas de la API
app.use('/api', routes)

// Manejo de rutas no encontradas
app.use(notFoundHandler)

// Manejo de errores
app.use(errorHandler)

export default app
