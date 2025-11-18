import prisma from '../config/database'
import type { SparePartFilters } from '../types'
import type { SparePart } from '@prisma/client'
import notificationService from './notificationService'

/**
 * Servicio de repuestos
 */
export class SparePartService {
  /**
   * Obtener todos los repuestos con filtros
   */
  async getAll(filters: SparePartFilters) {
    const {
      page = 1,
      limit = 10,
      search = '',
      category,
      lowStock = false,
      workshopId,
      sortBy = 'name',
      sortOrder = 'asc',
    } = filters

    // Convertir page y limit a números
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit
    const skip = (pageNum - 1) * limitNum

    console.log('🔍 Filtros recibidos:', { page: pageNum, limit: limitNum, workshopId, search, category, lowStock })

    const where: any = {}

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) where.category = category
    if (workshopId) {
      where.workshopId = workshopId
    }
    
    console.log('🔍 Where clause antes de lowStock:', JSON.stringify(where, null, 2))
    console.log('🔍 lowStock flag:', lowStock)
    
    if (lowStock) {
      // Para filtrar por stock bajo, necesitamos usar una raw query o filtrar después
      // Por ahora, lo manejaremos con una condición diferente
      const tempWhere = { ...where }
      
      const allParts = await prisma.sparePart.findMany({
        where: tempWhere,
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          category: true,
          unitOfMeasure: true,
          unitPrice: true,
          currentStock: true,
          minStock: true,
          maxStock: true,
          location: true,
          workshopId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      
      const partsWithLowStock = allParts.filter(part => part.currentStock <= part.minStock)
      
      return {
        spareParts: partsWithLowStock.slice(skip, skip + limitNum),
        total: partsWithLowStock.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(partsWithLowStock.length / limitNum),
      }
    }

    console.log('🔍 Ejecutando query final con where:', JSON.stringify(where, null, 2))
    
    const [spareParts, total] = await Promise.all([
      prisma.sparePart.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.sparePart.count({ where }),
    ])

    console.log('✅ Query exitosa, resultados:', spareParts.length)

    return {
      spareParts,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  /**
   * Obtener repuesto por ID
   */
  async getById(id: string) {
    const sparePart = await prisma.sparePart.findUnique({
      where: { id },
      include: {
        movements: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        workOrders: {
          include: {
            workOrder: {
              include: {
                vehicle: true,
              },
            },
          },
          orderBy: { requestedAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!sparePart) {
      throw new Error('Repuesto no encontrado')
    }

    return sparePart
  }

  /**
   * Obtener movimientos de un repuesto con filtros
   */
  async getMovements(
    sparePartId: string,
    filters?: {
      dateFrom?: string
      dateTo?: string
      movementType?: 'entrada' | 'salida' | 'ajuste'
      page?: number
      limit?: number
    }
  ) {
    // Verificar que el repuesto existe
    const sparePart = await prisma.sparePart.findUnique({
      where: { id: sparePartId },
    })

    if (!sparePart) {
      throw new Error('Repuesto no encontrado')
    }

    const {
      dateFrom,
      dateTo,
      movementType,
      page = 1,
      limit = 50,
    } = filters || {}

    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit
    const skip = (pageNum - 1) * limitNum

    const where: any = {
      sparePartId,
    }

    // Filtro por tipo de movimiento
    if (movementType) {
      where.movementType = movementType
    }

    // Filtro por fecha
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        // Incluir todo el día hasta las 23:59:59
        const endDate = new Date(dateTo)
        endDate.setHours(23, 59, 59, 999)
        where.createdAt.lte = endDate
      }
    }

    const [movements, total] = await Promise.all([
      prisma.sparePartMovement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sparePartMovement.count({ where }),
    ])

    return {
      movements,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  /**
   * Crear repuesto
   */
  async create(data: {
    code: string
    name: string
    description?: string
    category: string
    unitOfMeasure: string
    unitPrice: number
    currentStock: number
    minStock: number
    maxStock: number
    location?: string
    workshopId: string
  }) {
    const { code, ...rest } = data

    // Verificar código único
    const existing = await prisma.sparePart.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (existing) {
      throw new Error('Ya existe un repuesto con ese código')
    }

    const sparePart = await prisma.sparePart.create({
      data: {
        code: code.toUpperCase(),
        ...rest,
      },
    })

    // Registrar movimiento inicial
    if (rest.currentStock > 0) {
      await prisma.sparePartMovement.create({
        data: {
          sparePartId: sparePart.id,
          movementType: 'entrada',
          quantity: rest.currentStock,
          previousStock: 0,
          newStock: rest.currentStock,
          reason: 'Stock inicial',
        },
      })
    }

    return sparePart
  }

  /**
   * Actualizar repuesto
   */
  async update(id: string, data: Partial<{
    name: string
    description: string
    category: string
    unitOfMeasure: string
    unitPrice: number
    currentStock: number
    minStock: number
    maxStock: number
    location: string
    isActive: boolean
  }>) {
    const sparePart = await prisma.sparePart.findUnique({
      where: { id },
    })

    if (!sparePart) {
      throw new Error('Repuesto no encontrado')
    }

    const updated = await prisma.sparePart.update({
      where: { id },
      data,
    })

    return updated
  }

  /**
   * Ajustar stock
   */
  async adjustStock(
    id: string,
    quantity: number,
    movementType: 'entrada' | 'salida' | 'ajuste',
    reason: string,
    reference?: string
  ) {
    const sparePart = await prisma.sparePart.findUnique({
      where: { id },
    })

    if (!sparePart) {
      throw new Error('Repuesto no encontrado')
    }

    let newStock = sparePart.currentStock

    if (movementType === 'entrada') {
      newStock += quantity
    } else if (movementType === 'salida') {
      newStock -= quantity
      if (newStock < 0) {
        throw new Error('Stock insuficiente')
      }
    } else {
      // ajuste
      newStock = quantity
    }

    // Actualizar stock y registrar movimiento en transacción
    const updated = await prisma.$transaction(async (tx) => {
      const updatedPart = await tx.sparePart.update({
        where: { id },
        data: { currentStock: newStock },
      })

      await tx.sparePartMovement.create({
        data: {
          sparePartId: id,
          movementType,
          quantity: Math.abs(
            movementType === 'ajuste' ? quantity - sparePart.currentStock : quantity
          ),
          previousStock: sparePart.currentStock,
          newStock,
          reason,
          reference,
        },
      })

      return updatedPart
    })

    // Verificar stock crítico (menor o igual a minStock/2 o menor o igual a 0)
    const criticalThreshold = updated.minStock ? updated.minStock / 2 : 0
    if (updated.currentStock <= criticalThreshold || updated.currentStock <= 0) {
      notificationService
        .notifyCriticalStock(id)
        .catch((error) => console.error('❌ Error notificando stock crítico:', error))
    } else if (updated.currentStock <= updated.minStock) {
      // Stock bajo (ya existe, pero lo mantenemos)
      notificationService
        .notifyLowStock(id)
        .catch((error) => console.error('❌ Error notificando stock bajo:', error))
    }

    return this.getById(id)
  }

  /**
   * Obtener repuestos con stock bajo
   */
  async getLowStock() {
    const spareParts = await prisma.sparePart.findMany({
      where: {
        isActive: true,
        currentStock: {
          lte: prisma.sparePart.fields.minStock,
        },
      },
      orderBy: { currentStock: 'asc' },
    })

    return spareParts
  }

  /**
   * Obtener categorías únicas de repuestos
   */
  async getCategories() {
    const categories = await prisma.sparePart.findMany({
      where: {
        isActive: true,
      },
      select: {
        category: true,
      },
      distinct: ['category'],
      orderBy: {
        category: 'asc',
      },
    })

    return categories.map((c) => c.category)
  }

  /**
   * Obtener estadísticas de inventario
   */
  async getStats() {
    const [total, active, lowStock, outOfStock, byCategory, totalValue] = await Promise.all([
      prisma.sparePart.count(),
      prisma.sparePart.count({ where: { isActive: true } }),
      prisma.sparePart.count({
        where: {
          isActive: true,
          currentStock: { lte: prisma.sparePart.fields.minStock },
        },
      }),
      prisma.sparePart.count({
        where: {
          isActive: true,
          currentStock: 0,
        },
      }),
      prisma.sparePart.groupBy({
        by: ['category'],
        _count: true,
        _sum: {
          currentStock: true,
        },
      }),
      prisma.sparePart.aggregate({
        _sum: {
          currentStock: true,
        },
      }),
    ])

    return {
      total,
      active,
      lowStock,
      outOfStock,
      byCategory,
      totalItems: totalValue._sum.currentStock || 0,
    }
  }

  /**
   * Solicitar repuesto para orden de trabajo
   */
  async requestForWorkOrder(
    workOrderId: string,
    sparePartId: string,
    quantity: number,
    observations?: string
  ) {
    // Verificar que la orden existe
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
    })

    if (!workOrder) {
      throw new Error('Orden de trabajo no encontrada')
    }

    // Verificar que el repuesto existe y hay stock
    const sparePart = await prisma.sparePart.findUnique({
      where: { id: sparePartId },
    })

    if (!sparePart) {
      throw new Error('Repuesto no encontrado')
    }

    if (sparePart.currentStock <= 0) {
      throw new Error(`No se puede solicitar ${sparePart.name} porque no tiene stock disponible (Stock: ${sparePart.currentStock})`)
    }

    if (sparePart.currentStock < quantity) {
      throw new Error(`Stock insuficiente para ${sparePart.name}. Disponible: ${sparePart.currentStock}, Solicitado: ${quantity}`)
    }

    // Crear solicitud en estado 'solicitado' (sin descontar stock aún, espera aprobación del jefe de taller)
    const result = await prisma.$transaction(async (tx) => {
      // Verificar stock nuevamente dentro de la transacción
      const currentSparePart = await tx.sparePart.findUnique({
        where: { id: sparePartId },
      })

      if (!currentSparePart) {
        throw new Error('Repuesto no encontrado')
      }

      if (currentSparePart.currentStock <= 0) {
        throw new Error(`No se puede solicitar ${currentSparePart.name} porque no tiene stock disponible (Stock: ${currentSparePart.currentStock})`)
      }

      if (currentSparePart.currentStock < quantity) {
        throw new Error(`Stock insuficiente para ${currentSparePart.name}. Disponible: ${currentSparePart.currentStock}, Solicitado: ${quantity}`)
      }

      // Verificar si ya existe una solicitud del mismo repuesto para esta orden
      const existingRequest = await tx.workOrderSparePart.findFirst({
        where: {
          workOrderId,
          sparePartId,
          status: { in: ['solicitado', 'entregado'] }, // Solo considerar solicitudes activas
        },
      })

      let request

      if (existingRequest) {
        // Si existe y está en estado 'solicitado', actualizar la cantidad solicitada
        // Si está en estado 'entregado', 'usado' o 'sobrante', no se puede modificar
        if (existingRequest.status !== 'solicitado') {
          throw new Error(`No se puede modificar una solicitud que ya está ${existingRequest.status}`)
        }

        const newQuantityRequested = existingRequest.quantityRequested + quantity

        // Actualizar solicitud existente (sin descontar stock aún, espera aprobación)
        request = await tx.workOrderSparePart.update({
          where: { id: existingRequest.id },
          data: {
            quantityRequested: newQuantityRequested,
            observations: observations 
              ? (existingRequest.observations ? `${existingRequest.observations}\n${observations}` : observations)
              : existingRequest.observations,
            // Mantener estado 'solicitado' hasta aprobación del jefe de taller
          },
          include: {
            sparePart: true,
          },
        })

        return { request, updatedPart: currentSparePart }
      } else {
        // Si no existe, crear nueva solicitud en estado 'solicitado' (sin descontar stock)
        request = await tx.workOrderSparePart.create({
          data: {
            workOrderId,
            sparePartId,
            quantityRequested: quantity,
            observations,
            status: 'solicitado', // Estado 'solicitado' pendiente de aprobación del jefe de taller
          },
          include: {
            sparePart: true,
          },
        })

        return { request, updatedPart: currentSparePart }
      }
    })

    // Notificar a jefes de taller sobre nueva solicitud pendiente de aprobación
    notificationService
      .notifySparePartRequested(result.request.id)
      .catch((error) => console.error('❌ Error notificando solicitud de repuesto:', error))

    return result.request
  }

  /**
   * Solicitar múltiples repuestos para orden de trabajo
   */
  async requestMultipleForWorkOrder(
    workOrderId: string,
    requests: Array<{ sparePartId: string; quantity: number }>,
    observations?: string
  ) {
    // Verificar que la orden existe
    const workOrder = await prisma.workOrder.findUnique({
      where: { id: workOrderId },
    })

    if (!workOrder) {
      throw new Error('Orden de trabajo no encontrada')
    }

    if (!requests || requests.length === 0) {
      throw new Error('Debe solicitar al menos un repuesto')
    }

    // Agrupar repuestos duplicados sumando sus cantidades primero
    const groupedRequests = new Map<string, { sparePartId: string; quantity: number }>()
    for (const request of requests) {
      const existing = groupedRequests.get(request.sparePartId)
      if (existing) {
        existing.quantity += request.quantity
      } else {
        groupedRequests.set(request.sparePartId, { sparePartId: request.sparePartId, quantity: request.quantity })
      }
    }

    // Obtener IDs únicos de repuestos para verificar existencia
    const uniqueSparePartIds = Array.from(new Set(requests.map((r) => r.sparePartId)))
    
    // Verificar todos los repuestos y stock después de agrupar
    const spareParts = await prisma.sparePart.findMany({
      where: {
        id: { in: uniqueSparePartIds },
      },
    })

    if (spareParts.length !== uniqueSparePartIds.length) {
      throw new Error('Uno o más repuestos no fueron encontrados')
    }

    // Validar stock para cada repuesto agrupado (considerando cantidad total)
    for (const request of Array.from(groupedRequests.values())) {
      const sparePart = spareParts.find((p) => p.id === request.sparePartId)
      if (!sparePart) {
        throw new Error(`Repuesto ${request.sparePartId} no encontrado`)
      }
      if (sparePart.currentStock <= 0) {
        throw new Error(
          `No se puede solicitar ${sparePart.name} porque no tiene stock disponible (Stock: ${sparePart.currentStock})`
        )
      }
      if (sparePart.currentStock < request.quantity) {
        throw new Error(
          `Stock insuficiente para ${sparePart.name}. Disponible: ${sparePart.currentStock}, Solicitado: ${request.quantity}`
        )
      }
    }

    // Procesar todas las solicitudes agrupadas en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const createdRequests = []

      for (const request of Array.from(groupedRequests.values())) {
        // Verificar stock nuevamente dentro de la transacción
        const currentSparePart = await tx.sparePart.findUnique({
          where: { id: request.sparePartId },
        })

        if (!currentSparePart) {
          throw new Error(`Repuesto ${request.sparePartId} no encontrado`)
        }
        
        if (currentSparePart.currentStock <= 0) {
          throw new Error(
            `No se puede solicitar ${currentSparePart.name} porque no tiene stock disponible (Stock: ${currentSparePart.currentStock})`
          )
        }
        
        if (currentSparePart.currentStock < request.quantity) {
          throw new Error(
            `Stock insuficiente para ${currentSparePart.name}. Disponible: ${currentSparePart.currentStock}, Solicitado: ${request.quantity}`
          )
        }

        // Verificar si ya existe una solicitud del mismo repuesto para esta orden
        const existingRequest = await tx.workOrderSparePart.findFirst({
          where: {
            workOrderId,
            sparePartId: request.sparePartId,
            status: { in: ['solicitado', 'entregado'] }, // Solo considerar solicitudes activas
          },
        })

        let createdRequest

        if (existingRequest) {
          // Si existe y está en estado 'solicitado', actualizar la cantidad solicitada
          if (existingRequest.status !== 'solicitado') {
            throw new Error(`No se puede modificar una solicitud que ya está ${existingRequest.status}`)
          }

          const newQuantityRequested = existingRequest.quantityRequested + request.quantity

          // Actualizar solicitud existente (sin descontar stock aún, espera aprobación)
          createdRequest = await tx.workOrderSparePart.update({
            where: { id: existingRequest.id },
            data: {
              quantityRequested: newQuantityRequested,
              observations: observations 
                ? (existingRequest.observations ? `${existingRequest.observations}\n${observations}` : observations)
                : existingRequest.observations,
              // Mantener estado 'solicitado' hasta aprobación del jefe de taller
            },
            include: {
              sparePart: true,
            },
          })
        } else {
          // Si no existe, crear nueva solicitud en estado 'solicitado' (sin descontar stock)
          createdRequest = await tx.workOrderSparePart.create({
            data: {
              workOrderId,
              sparePartId: request.sparePartId,
              quantityRequested: request.quantity,
              observations,
              status: 'solicitado', // Estado 'solicitado' pendiente de aprobación del jefe de taller
            },
            include: {
              sparePart: true,
            },
          })
        }

        createdRequests.push(createdRequest)
      }

      return createdRequests
    })

    // Notificar a jefes de taller sobre nuevas solicitudes pendientes de aprobación
    for (const request of result) {
      notificationService
        .notifySparePartRequested(request.id)
        .catch((error) => console.error('❌ Error notificando solicitud de repuesto:', error))
    }

    return result
  }

  /**
   * Obtener solicitudes pendientes de aprobación
   */
  async getPendingRequests(workshopId?: string) {
    const where: any = {
      status: 'solicitado',
    }

    if (workshopId) {
      where.workOrder = {
        workshopId,
      }
    }

    const requests = await prisma.workOrderSparePart.findMany({
      where,
      include: {
        sparePart: true,
        workOrder: {
          include: {
            vehicle: {
              select: {
                licensePlate: true,
              },
            },
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
      orderBy: {
        requestedAt: 'desc',
      },
    })

    return requests
  }

  /**
   * Aprobar solicitud de repuesto (descontar stock y marcar como entregado)
   */
  async approveRequest(id: string, _approvedById: string) {
    const request = await prisma.workOrderSparePart.findUnique({
      where: { id },
      include: {
        sparePart: true,
        workOrder: true,
      },
    })

    if (!request) {
      throw new Error('Solicitud no encontrada')
    }

    if (request.status !== 'solicitado') {
      throw new Error(`No se puede aprobar una solicitud que está en estado ${request.status}`)
    }

    // Verificar stock disponible
    if (request.sparePart.currentStock < request.quantityRequested) {
      throw new Error(
        `Stock insuficiente para ${request.sparePart.name}. Disponible: ${request.sparePart.currentStock}, Solicitado: ${request.quantityRequested}`
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // Verificar stock nuevamente dentro de la transacción
      const currentSparePart = await tx.sparePart.findUnique({
        where: { id: request.sparePartId },
      })

      if (!currentSparePart) {
        throw new Error('Repuesto no encontrado')
      }

      if (currentSparePart.currentStock < request.quantityRequested) {
        throw new Error(
          `Stock insuficiente para ${currentSparePart.name}. Disponible: ${currentSparePart.currentStock}, Solicitado: ${request.quantityRequested}`
        )
      }

      // Descontar stock
      const newStock = currentSparePart.currentStock - request.quantityRequested
      const now = new Date()

      // Actualizar stock
      const updatedPart = await tx.sparePart.update({
        where: { id: request.sparePartId },
        data: { currentStock: newStock },
        select: {
          id: true,
          currentStock: true,
          minStock: true,
        },
      })

      // Registrar movimiento
      await tx.sparePartMovement.create({
        data: {
          sparePartId: request.sparePartId,
          movementType: 'salida',
          quantity: request.quantityRequested,
          previousStock: currentSparePart.currentStock,
          newStock,
          reason: 'Solicitud aprobada por jefe de taller',
          reference: request.workOrder.orderNumber,
        },
      })

      // Actualizar solicitud a estado 'entregado'
      const updatedRequest = await tx.workOrderSparePart.update({
        where: { id },
        data: {
          status: 'entregado',
          quantityDelivered: request.quantityRequested,
          deliveredAt: now,
        },
        include: {
          sparePart: true,
          workOrder: {
            include: {
              vehicle: true,
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

      return { request: updatedRequest, updatedPart }
    })

    // Notificar al mecánico que el repuesto fue aprobado y entregado
    notificationService
      .notifySparePartDelivered(id)
      .catch((error) => console.error('❌ Error notificando repuesto entregado:', error))

    // Verificar stock crítico después de descontar
    const criticalThreshold = result.updatedPart.minStock ? result.updatedPart.minStock / 2 : 0
    if (result.updatedPart.currentStock <= criticalThreshold || result.updatedPart.currentStock <= 0) {
      notificationService
        .notifyCriticalStock(result.updatedPart.id)
        .catch((error) => console.error('❌ Error notificando stock crítico:', error))
    } else if (result.updatedPart.currentStock <= result.updatedPart.minStock) {
      notificationService
        .notifyLowStock(result.updatedPart.id)
        .catch((error) => console.error('❌ Error notificando stock bajo:', error))
    }

    // Notificar a jefes de taller si el stock queda por debajo de 10
    if (result.updatedPart.currentStock < 10 && result.request.sparePart) {
      this.notifyWorkshopManagersLowStock(
        request.workOrder.workshopId,
        result.request.sparePart,
        result.updatedPart.currentStock,
        request.workOrder.orderNumber
      ).catch((error) => console.error('❌ Error notificando a jefes de taller:', error))
    }

    return result.request
  }

  /**
   * Rechazar solicitud de repuesto
   */
  async rejectRequest(id: string, _rejectedById: string, reason?: string) {
    const request = await prisma.workOrderSparePart.findUnique({
      where: { id },
      include: {
        sparePart: true,
        workOrder: {
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

    if (!request) {
      throw new Error('Solicitud no encontrada')
    }

    if (request.status !== 'solicitado') {
      throw new Error(`No se puede rechazar una solicitud que está en estado ${request.status}`)
    }

    // Actualizar estado a 'rechazado'
    const updatedRequest = await prisma.workOrderSparePart.update({
      where: { id },
      data: {
        status: 'rechazado',
        observations: reason
          ? (request.observations ? `${request.observations}\n[Rechazado: ${reason}]` : `[Rechazado: ${reason}]`)
          : request.observations,
      },
      include: {
        sparePart: true,
        workOrder: {
          include: {
            vehicle: true,
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

    // Notificar al mecánico que la solicitud fue rechazada
    if (request.workOrder.assignedToId) {
      notificationService
        .create({
          userId: request.workOrder.assignedToId,
          title: 'Solicitud de repuesto rechazada',
          message: `Tu solicitud de ${request.quantityRequested} unidad(es) de ${request.sparePart.name} para la orden ${request.workOrder.orderNumber} fue rechazada.${reason ? ` Motivo: ${reason}` : ''}`,
          type: 'spare_part_rejected',
          relatedTo: 'work-orders',
          relatedId: request.workOrderId,
        })
        .catch((error) => console.error('❌ Error notificando rechazo de solicitud:', error))
    }

    return updatedRequest
  }

  /**
   * Entregar repuesto para orden de trabajo
   */
  async deliverForWorkOrder(id: string, quantityDelivered: number) {
    const request = await prisma.workOrderSparePart.findUnique({
      where: { id },
      include: {
        sparePart: true,
        workOrder: true,
      },
    })

    if (!request) {
      throw new Error('Solicitud no encontrada')
    }

    // Si el estado ya es 'entregado', significa que fue entregado automáticamente al solicitar
    // (el stock se descontó al crear la solicitud)
    if (request.status === 'entregado') {
      throw new Error('El repuesto ya fue entregado automáticamente al solicitar (el stock fue descontado)')
    }

    if (request.status === 'usado' || request.status === 'sobrante') {
      throw new Error('La solicitud ya fue procesada')
    }

    // Verificar que la cantidad entregada no exceda la solicitada
    if (quantityDelivered > request.quantityRequested) {
      throw new Error(`La cantidad entregada (${quantityDelivered}) no puede ser mayor a la solicitada (${request.quantityRequested})`)
    }

    // NOTA: Este método ya no debería usarse normalmente, ya que las solicitudes
    // se crean directamente con estado 'entregado' cuando se descuenta el stock.
    // Este método se mantiene por compatibilidad con solicitudes antiguas que aún estén en estado 'solicitado'
    await prisma.workOrderSparePart.update({
      where: { id },
      data: {
        quantityDelivered,
        status: 'entregado', // Cambiar a entregado
        deliveredAt: new Date(),
      },
    })

    // Notificar repuesto entregado
    notificationService
      .notifySparePartDelivered(id)
      .catch((error) => console.error('❌ Error notificando repuesto entregado:', error))

    return this.getById(request.sparePartId)
  }

  /**
   * Marcar repuesto como usado
   */
  async markAsUsed(id: string) {
    const request = await prisma.workOrderSparePart.findUnique({
      where: { id },
      include: {
        sparePart: true,
        workOrder: true,
      },
    })

    if (!request) {
      throw new Error('Solicitud no encontrada')
    }

    if (request.status === 'usado') {
      throw new Error('El repuesto ya fue marcado como usado')
    }

    if (request.status === 'sobrante') {
      throw new Error('No se puede marcar como usado un repuesto que ya fue marcado como sobrante')
    }

    // Solo actualizar el estado, el stock ya fue descontado en la entrega
    await prisma.workOrderSparePart.update({
      where: { id },
      data: {
        status: 'usado',
      },
    })

    return request
  }

  /**
   * Marcar repuesto como sobrante y devolver stock al inventario
   */
  async markAsSurplus(id: string, quantityToReturn?: number) {
    const request = await prisma.workOrderSparePart.findUnique({
      where: { id },
      include: {
        sparePart: true,
        workOrder: true,
      },
    })

    if (!request) {
      throw new Error('Solicitud no encontrada')
    }

    if (request.status === 'usado') {
      throw new Error('No se puede marcar como sobrante un repuesto que ya fue usado')
    }

    if (request.status === 'sobrante') {
      throw new Error('El repuesto ya fue marcado como sobrante')
    }

    // Determinar cantidad a devolver
    const quantityReturned = quantityToReturn || (request.quantityDelivered || request.quantityRequested)

    if (quantityReturned <= 0) {
      throw new Error('La cantidad a devolver debe ser mayor a 0')
    }

    if (quantityReturned > (request.quantityDelivered || request.quantityRequested)) {
      throw new Error('La cantidad a devolver no puede ser mayor a la cantidad entregada')
    }

    // Actualizar estado y devolver stock al inventario en transacción
    await prisma.$transaction([
      prisma.workOrderSparePart.update({
        where: { id },
        data: {
          status: 'sobrante',
        },
      }),
      prisma.sparePart.update({
        where: { id: request.sparePartId },
        data: {
          currentStock: {
            increment: quantityReturned,
          },
        },
      }),
      prisma.sparePartMovement.create({
        data: {
          sparePartId: request.sparePartId,
          movementType: 'entrada',
          quantity: quantityReturned,
          previousStock: request.sparePart.currentStock,
          newStock: request.sparePart.currentStock + quantityReturned,
          reason: 'Devolución de repuesto sobrante',
          reference: request.workOrder.orderNumber,
        },
      }),
    ])

    return request
  }

  /**
   * Notificar a jefes de taller cuando el stock de un repuesto queda por debajo de 10
   */
  private async notifyWorkshopManagersLowStock(
    workshopId: string,
    sparePart: SparePart,
    currentStock: number,
    workOrderNumber: string
  ): Promise<void> {
    try {
      // Obtener jefes de taller del taller
      const workshopManagers = await prisma.user.findMany({
        where: {
          workshopId: workshopId,
          isActive: true,
          role: {
            name: 'Jefe de Taller',
          },
        },
        select: {
          id: true,
        },
      })

      if (workshopManagers.length === 0) {
        console.log(`⚠️ No se encontraron jefes de taller para el taller ${workshopId}`)
        return
      }

      const managerIds = workshopManagers.map((m) => m.id)

      // Crear notificaciones para todos los jefes de taller
      await notificationService.createMany(managerIds, {
        title: '⚠️ Stock bajo de repuesto',
        message: `El repuesto "${sparePart.name}" (${sparePart.code}) tiene stock bajo (${currentStock} unidades) después de la solicitud para la orden ${workOrderNumber}. Por favor, revisar el inventario.`,
        type: 'spare_part_low_stock',
        relatedTo: 'spare-parts',
        relatedId: sparePart.id,
      })

      console.log(`✅ Notificaciones enviadas a ${managerIds.length} jefe(s) de taller sobre stock bajo de ${sparePart.name}`)
    } catch (error) {
      console.error('❌ Error notificando a jefes de taller:', error)
      throw error
    }
  }
}

export default new SparePartService()


