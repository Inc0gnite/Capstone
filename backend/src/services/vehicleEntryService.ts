import prisma from '../config/database'
import { generateEntryCode } from '../utils/generators'

/**
 * Servicio de ingresos de vehículos
 */
export class VehicleEntryService {
  /**
   * Obtener todos los ingresos con filtros y paginación
   */
  async getAll(filters: {
    page?: number
    limit?: number
    search?: string
    workshopId?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }) {
    const { page = 1, limit = 10, search = '', workshopId, status, dateFrom, dateTo } = filters
    const pageNum = parseInt(page.toString())
    const limitNum = parseInt(limit.toString())
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (search) {
      where.OR = [
        { entryCode: { contains: search, mode: 'insensitive' } },
        { driverName: { contains: search, mode: 'insensitive' } },
        { driverRut: { contains: search, mode: 'insensitive' } },
        { vehicle: { licensePlate: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (workshopId) where.workshopId = workshopId
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.entryDate = {}
      if (dateFrom) where.entryDate.gte = new Date(dateFrom)
      if (dateTo) where.entryDate.lte = new Date(dateTo)
    }

    const [entries, total] = await Promise.all([
      prisma.vehicleEntry.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          vehicle: true,
          workshop: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          keyControl: true,
        },
        orderBy: { entryDate: 'desc' },
      }),
      prisma.vehicleEntry.count({ where }),
    ])

    return {
      entries,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  /**
   * Obtener ingreso por ID
   */
  async getById(id: string) {
    const entry = await prisma.vehicleEntry.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            region: true,
          },
        },
        workshop: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        keyControl: true,
        workOrders: {
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!entry) {
      throw new Error('Ingreso no encontrado')
    }

    return entry
  }

  /**
   * Crear ingreso de vehículo
   */
  async create(data: {
    vehicleId: string
    workshopId: string
    driverRut: string
    driverName: string
    driverPhone?: string
    entryKm: number
    fuelLevel: string
    hasKeys: boolean
    observations?: string
    photos?: string[]
    createdById: string
    keyLocation?: string
    entryTime?: string
  }) {
    console.log('🚗 Creando ingreso de vehículo con datos:', data)
    const {
      vehicleId,
      workshopId,
      driverRut,
      driverName,
      driverPhone,
      entryKm,
      fuelLevel,
      hasKeys,
      observations,
      // photos, // Comentado temporalmente
      createdById,
      keyLocation,
      entryTime,
    } = data

    // Generar código único secuencial
    console.log('🔑 Generando código de ingreso...')
    const entryCode = await generateEntryCode()
    console.log('✅ Código de ingreso generado:', entryCode)

    // Verificar que el vehículo existe
    console.log('🔍 Verificando vehículo:', vehicleId)
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } })
    if (!vehicle) {
      console.log('❌ Vehículo no encontrado:', vehicleId)
      throw new Error('Vehículo no encontrado')
    }
    console.log('✅ Vehículo encontrado:', vehicle.licensePlate)

    // Verificar que el taller existe
    console.log('🔍 Verificando taller:', workshopId)
    const workshop = await prisma.workshop.findUnique({ where: { id: workshopId } })
    if (!workshop) {
      console.log('❌ Taller no encontrado:', workshopId)
      throw new Error('Taller no encontrado')
    }
    console.log('✅ Taller encontrado:', workshop.name)

    // Crear ingreso con transacción
    const entry = await prisma.$transaction(async (tx) => {
      // Crear el ingreso
      const newEntry = await tx.vehicleEntry.create({
        data: {
          entryCode,
          vehicleId,
          workshopId,
          driverRut,
          driverName,
          driverPhone,
          entryDate: new Date(),
          entryTime: entryTime || new Date().toTimeString().slice(0, 8), // HH:MM:SS
          entryKm,
          fuelLevel,
          hasKeys,
          observations,
          // photos: photos || [], // Comentado temporalmente hasta implementar la relación
          createdById,
        },
        include: {
          vehicle: true,
          workshop: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      // Actualizar estado del vehículo
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'in_maintenance' },
      })

      // Crear control de llaves si tiene llaves
      if (hasKeys && keyLocation) {
        await tx.keyControl.create({
          data: {
            entryId: newEntry.id,
            keyLocation,
          },
        })
      }

      return newEntry
    })

    console.log('✅ Ingreso creado exitosamente:', entry.id)
    return this.getById(entry.id)
  }

  /**
   * Actualizar ingreso
   */
  async update(id: string, data: Partial<{
    driverRut: string
    driverName: string
    driverPhone: string
    entryKm: number
    exitKm: number
    fuelLevel: string
    observations: string
    photos: string[]
    status: string
  }>) {
    const entry = await prisma.vehicleEntry.findUnique({
      where: { id },
    })

    if (!entry) {
      throw new Error('Ingreso no encontrado')
    }

    // Filtrar campos que no existen en el modelo
    const { photos, ...updateData } = data as any
    
    const updatedEntry = await prisma.vehicleEntry.update({
      where: { id },
      data: updateData,
      include: {
        vehicle: true,
        workshop: true,
        keyControl: true,
      },
    })

    return updatedEntry
  }

  /**
   * Verificar si un vehículo está listo para salida
   */
  async isReadyForExit(id: string): Promise<boolean> {
    const entry = await prisma.vehicleEntry.findUnique({
      where: { id },
      include: { 
        workOrders: {
          where: { currentStatus: 'completado' }
        }
      },
    })

    if (!entry) {
      return false
    }

    // Verificar que hay órdenes de trabajo completadas
    return entry.workOrders && entry.workOrders.length > 0
  }

  /**
   * Registrar salida del vehículo
   */
  async registerExit(id: string, exitKm: number, exitTime?: string) {
    const entry = await prisma.vehicleEntry.findUnique({
      where: { id },
      include: { 
        vehicle: true,
        workOrders: {
          where: { currentStatus: 'completado' }
        }
      },
    })

    if (!entry) {
      throw new Error('Ingreso no encontrado')
    }

    // Validar que hay órdenes de trabajo completadas
    if (!entry.workOrders || entry.workOrders.length === 0) {
      throw new Error('Esperando orden: El recepcionista debe marcar la orden como lista antes de registrar la salida')
    }

    if (entry.exitDate) {
      throw new Error('El vehículo ya tiene registrada una salida')
    }

    // Actualizar ingreso y vehículo en transacción
    await prisma.$transaction([
      prisma.vehicleEntry.update({
        where: { id },
        data: {
          exitDate: new Date(),
          exitTime: exitTime || new Date().toTimeString().slice(0, 8), // HH:MM:SS
          exitKm,
          status: 'salida',
        },
      }),
      prisma.vehicle.update({
        where: { id: entry.vehicleId },
        data: { status: 'active' },
      }),
    ])

    return this.getById(id)
  }

  /**
   * Gestionar control de llaves
   */
  async updateKeyControl(
    entryId: string,
    data: {
      keyLocation?: string
      deliveredTo?: string
      deliveredAt?: Date
      returnedBy?: string
      returnedAt?: Date
      observations?: string
    }
  ) {
    const entry = await prisma.vehicleEntry.findUnique({
      where: { id: entryId },
      include: { keyControl: true },
    })

    if (!entry) {
      throw new Error('Ingreso no encontrado')
    }

    let keyControl

    if (entry.keyControl) {
      // Actualizar control existente
      keyControl = await prisma.keyControl.update({
        where: { entryId },
        data,
      })
    } else {
      // Crear nuevo control
      keyControl = await prisma.keyControl.create({
        data: {
          entryId,
          keyLocation: data.keyLocation || 'No especificado',
          ...data,
        },
      })
    }

    return keyControl
  }

  /**
   * Obtener ingresos activos (sin salida)
   */
  async getActiveEntries(workshopId?: string) {
    const where: any = {
      exitDate: null, // Solo ingresos sin salida
    }

    if (workshopId) {
      where.workshopId = workshopId
    }

    const entries = await prisma.vehicleEntry.findMany({
      where,
      include: {
        vehicle: true,
        workshop: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        workOrders: {
          include: {
            spareParts: true,
          },
        },
        keyControl: true,
      },
      orderBy: {
        entryDate: 'desc',
      },
    })

    return entries
  }
}

export default new VehicleEntryService()


