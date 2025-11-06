import prisma from '../config/database'
import type { SparePartFilters } from '../types'

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
    await prisma.$transaction([
      prisma.sparePart.update({
        where: { id },
        data: { currentStock: newStock },
      }),
      prisma.sparePartMovement.create({
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
      }),
    ])

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

    // Crear solicitud y descontar stock en transacción
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

      // Crear solicitud
      const request = await tx.workOrderSparePart.create({
        data: {
          workOrderId,
          sparePartId,
          quantityRequested: quantity,
          observations,
          status: 'solicitado',
        },
        include: {
          sparePart: true,
        },
      })

      // Descontar stock
      const newStock = currentSparePart.currentStock - quantity
      await tx.sparePart.update({
        where: { id: sparePartId },
        data: { currentStock: newStock },
      })

      // Registrar movimiento
      await tx.sparePartMovement.create({
        data: {
          sparePartId,
          movementType: 'salida',
          quantity,
          previousStock: currentSparePart.currentStock,
          newStock,
          reason: 'Solicitud para orden de trabajo',
          reference: workOrder.orderNumber,
        },
      })

      return request
    })

    return result
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

    // Verificar todos los repuestos y stock antes de procesar
    const spareParts = await prisma.sparePart.findMany({
      where: {
        id: { in: requests.map((r) => r.sparePartId) },
      },
    })

    if (spareParts.length !== requests.length) {
      throw new Error('Uno o más repuestos no fueron encontrados')
    }

    // Validar stock para cada repuesto
    for (const request of requests) {
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

    // Procesar todas las solicitudes en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const createdRequests = []

      for (const request of requests) {
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

        // Crear solicitud
        const createdRequest = await tx.workOrderSparePart.create({
          data: {
            workOrderId,
            sparePartId: request.sparePartId,
            quantityRequested: request.quantity,
            observations,
            status: 'solicitado',
          },
          include: {
            sparePart: true,
          },
        })

        // Descontar stock
        const newStock = currentSparePart.currentStock - request.quantity
        await tx.sparePart.update({
          where: { id: request.sparePartId },
          data: { currentStock: newStock },
        })

        // Registrar movimiento
        await tx.sparePartMovement.create({
          data: {
            sparePartId: request.sparePartId,
            movementType: 'salida',
            quantity: request.quantity,
            previousStock: currentSparePart.currentStock,
            newStock,
            reason: 'Solicitud para orden de trabajo',
            reference: workOrder.orderNumber,
          },
        })

        createdRequests.push(createdRequest)
      }

      return createdRequests
    })

    return result
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

    if (request.status === 'entregado' || request.status === 'usado' || request.status === 'sobrante') {
      throw new Error('La solicitud ya fue procesada')
    }

    // Verificar que la cantidad entregada no exceda la solicitada
    if (quantityDelivered > request.quantityRequested) {
      throw new Error(`La cantidad entregada (${quantityDelivered}) no puede ser mayor a la solicitada (${request.quantityRequested})`)
    }

    // NO descontar stock aquí porque ya se descontó al solicitar
    // Solo actualizar el estado de la solicitud
    await prisma.workOrderSparePart.update({
      where: { id },
      data: {
        quantityDelivered,
        status: 'solicitado', // Mantener como solicitado hasta que se marque como usado o sobrante
        deliveredAt: new Date(),
      },
    })

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
}

export default new SparePartService()


