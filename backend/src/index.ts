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

// Middlewares de seguridad
app.use(helmet())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174', // Puerto alternativo de Vite
    'http://localhost:3000'  // Puerto del backend
  ],
  credentials: true,
}))

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




