import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import logger from './config/logger.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler'
import routes from './routes'

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Trust proxy para Railway y otros servicios con proxy reverso
// Esto permite que express-rate-limit funcione correctamente con headers X-Forwarded-For
app.set('trust proxy', 1)

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

// Rate limiting - más permisivo para usuarios autenticados
// NOTA: Se aplica por IP porque se ejecuta antes de la autenticación
// Si múltiples usuarios comparten IP, pueden verse afectados
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 1000 : 500, // Aumentado a 500 en producción
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
  standardHeaders: true, // Incluye headers X-RateLimit-*
  legacyHeaders: false,
  skip: () => {
    // En desarrollo, permitir más requests
    return process.env.NODE_ENV === 'development'
  },
  // Handler personalizado para errores 429
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
      retryAfter: Math.ceil((15 * 60 * 1000) / 1000), // Segundos hasta que se reinicie la ventana (15 min)
    })
  },
})
app.use('/api', limiter)

// Body parser (permitir cargas de imágenes en base64)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

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

// Iniciar servidor (solo en desarrollo o producción tradicional)
if (process.env.NODE_ENV !== 'vercel') {
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    logger.info(`📝 API disponible en http://localhost:${PORT}/api`)
    logger.info(`❤️  Health check en http://localhost:${PORT}/health`)
    logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`)
  })
}

export default app




