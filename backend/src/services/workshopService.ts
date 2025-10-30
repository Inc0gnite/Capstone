import prisma from '../config/database'

/**
 * Servicio de talleres y regiones
 */
export class WorkshopService {
  // ============ REGIONES ============

  /**
   * Obtener todas las regiones
   */
  async getAllRegions() {
    const regions = await prisma.region.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            workshops: true,
            vehicles: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return regions
  }

  /**
   * Obtener región por ID
   */
  async getRegionById(id: string) {
    const region = await prisma.region.findUnique({
      where: { id },
      include: {
        workshops: true,
        vehicles: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!region) {
      throw new Error('Región no encontrada')
    }

    return region
  }

  /**
   * Crear región
   */
  async createRegion(data: { code: string; name: string }) {
    const { code, name } = data

    const existing = await prisma.region.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existing) {
      throw new Error('Ya existe una región con ese código')
    }

    const region = await prisma.region.create({
      data: {
        code: code.toUpperCase(),
        name,
      },
    })

    return region
  }

  /**
   * Actualizar región
   */
  async updateRegion(id: string, data: { name?: string; isActive?: boolean }) {
    const region = await prisma.region.findUnique({
      where: { id },
    })

    if (!region) {
      throw new Error('Región no encontrada')
    }

    const updated = await prisma.region.update({
      where: { id },
      data,
    })

    return updated
  }

  // ============ TALLERES ============

  /**
   * Obtener todos los talleres
   */
  async getAllWorkshops() {
    const workshops = await prisma.workshop.findMany({
      where: { isActive: true },
      include: {
        region: true,
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: {
            users: true,
            entries: true,
            workOrders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return workshops
  }

  /**
   * Obtener taller por ID
   */
  async getWorkshopById(id: string) {
    const workshop = await prisma.workshop.findUnique({
      where: { id },
      include: {
        region: true,
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        users: {
          where: { isActive: true },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        entries: {
          where: { status: 'ingresado' },
          include: {
            vehicle: true,
          },
        },
      },
    })

    if (!workshop) {
      throw new Error('Taller no encontrado')
    }

    return workshop
  }

  /**
   * Obtener talleres por región
   */
  async getWorkshopsByRegion(regionId: string) {
    const workshops = await prisma.workshop.findMany({
      where: {
        regionId,
        isActive: true,
      },
      include: {
        schedules: {
          where: { isActive: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return workshops
  }

  /**
   * Crear taller
   */
  async createWorkshop(data: {
    code: string
    name: string
    regionId: string
    address: string
    city: string
    phone?: string
    capacity?: number
  }) {
    const { code, regionId, ...rest } = data

    // Verificar código único
    const existing = await prisma.workshop.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existing) {
      throw new Error('Ya existe un taller con ese código')
    }

    // Verificar que la región exista
    const region = await prisma.region.findUnique({
      where: { id: regionId },
    })

    if (!region) {
      throw new Error('Región no encontrada')
    }

    const workshop = await prisma.workshop.create({
      data: {
        code: code.toUpperCase(),
        regionId,
        ...rest,
      },
      include: {
        region: true,
      },
    })

    return workshop
  }

  /**
   * Actualizar taller
   */
  async updateWorkshop(
    id: string,
    data: Partial<{
      name: string
      address: string
      city: string
      phone: string
      capacity: number
      isActive: boolean
    }>
  ) {
    const workshop = await prisma.workshop.findUnique({
      where: { id },
    })

    if (!workshop) {
      throw new Error('Taller no encontrado')
    }

    const updated = await prisma.workshop.update({
      where: { id },
      data,
      include: {
        region: true,
      },
    })

    return updated
  }

  // ============ HORARIOS ============

  /**
   * Configurar horario de taller
   */
  async setSchedule(data: {
    workshopId: string
    dayOfWeek: number
    openTime: string
    closeTime: string
  }) {
    const { workshopId, dayOfWeek, openTime, closeTime } = data

    // Verificar que el taller existe
    const workshop = await prisma.workshop.findUnique({
      where: { id: workshopId },
    })

    if (!workshop) {
      throw new Error('Taller no encontrado')
    }

    // Buscar si ya existe un horario para ese día
    const existing = await prisma.workshopSchedule.findFirst({
      where: {
        workshopId,
        dayOfWeek,
      },
    })

    let schedule

    if (existing) {
      // Actualizar horario existente
      schedule = await prisma.workshopSchedule.update({
        where: { id: existing.id },
        data: {
          openTime,
          closeTime,
          isActive: true,
        },
      })
    } else {
      // Crear nuevo horario
      schedule = await prisma.workshopSchedule.create({
        data: {
          workshopId,
          dayOfWeek,
          openTime,
          closeTime,
        },
      })
    }

    return schedule
  }

  /**
   * Obtener estadísticas de taller
   */
  async getWorkshopStats(workshopId: string) {
    const [
      totalEntries,
      activeEntries,
      totalWorkOrders,
      activeWorkOrders,
      completedToday,
    ] = await Promise.all([
      prisma.vehicleEntry.count({ where: { workshopId } }),
      prisma.vehicleEntry.count({ where: { workshopId, status: 'ingresado' } }),
      prisma.workOrder.count({ where: { workshopId } }),
      prisma.workOrder.count({
        where: {
          workshopId,
          currentStatus: { in: ['pendiente', 'en_progreso', 'pausado'] },
        },
      }),
      prisma.workOrder.count({
        where: {
          workshopId,
          currentStatus: 'completado',
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ])

    return {
      totalEntries,
      activeEntries,
      totalWorkOrders,
      activeWorkOrders,
      completedToday,
    }
  }
}

export default new WorkshopService()


