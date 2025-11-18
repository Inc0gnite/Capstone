import { Router } from 'express'
import authRoutes from './authRoutes'
import userRoutes from './userRoutes'
import roleRoutes from './roleRoutes'
import vehicleRoutes from './vehicleRoutes'
import vehicleEntryRoutes from './vehicleEntryRoutes'
import workOrderRoutes from './workOrderRoutes'
import sparePartRoutes from './sparePartRoutes'
import workshopRoutes from './workshopRoutes'
import regionRoutes from './regionRoutes'
import dashboardRoutes from './dashboardRoutes'
import notificationRoutes from './notificationRoutes'
import photoRoutes from './photoRoutes'
import documentRoutes from './documentRoutes'
import mechanicRoutes from './mechanicRoutes'
import testRoutes from './testRoutes'
import reportRoutes from './reportRoutes'
import adminRoutes from './adminRoutes'

const router = Router()

// Rutas públicas
router.use('/auth', authRoutes)

// Rutas protegidas
router.use('/users', userRoutes)
router.use('/roles', roleRoutes)
router.use('/vehicles', vehicleRoutes)
router.use('/vehicle-entries', vehicleEntryRoutes)
router.use('/work-orders', workOrderRoutes)
router.use('/spare-parts', sparePartRoutes)
router.use('/workshops', workshopRoutes)
router.use('/regions', regionRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/notifications', notificationRoutes)
router.use('/photos', photoRoutes)
router.use('/documents', documentRoutes)
router.use('/mechanics', mechanicRoutes)
router.use('/test', testRoutes)
router.use('/reports', reportRoutes)
router.use('/admin', adminRoutes)

export default router


