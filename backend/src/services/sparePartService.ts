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

    if (sparePart.currentStock < quantity) {
      throw new Error('Stock insuficiente')
    }

    // Crear solicitud
    const request = await prisma.workOrderSparePart.create({
      data: {
        workOrderId,
        sparePartId,
        quantityRequested: quantity,
        observations,
      },
      include: {
        sparePart: true,
      },
    })

    return request
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

    if (request.status === 'entregado') {
      throw new Error('La solicitud ya fue entregada')
    }

    // Verificar stock
    if (request.sparePart.currentStock < quantityDelivered) {
      throw new Error('Stock insuficiente')
    }

    // Actualizar solicitud y stock en transacción
    await prisma.$transaction([
      prisma.workOrderSparePart.update({
        where: { id },
        data: {
          quantityDelivered,
          status: 'entregado',
          deliveredAt: new Date(),
        },
      }),
      prisma.sparePart.update({
        where: { id: request.sparePartId },
        data: {
          currentStock: {
            decrement: quantityDelivered,
          },
        },
      }),
      prisma.sparePartMovement.create({
        data: {
          sparePartId: request.sparePartId,
          movementType: 'salida',
          quantity: quantityDelivered,
          previousStock: request.sparePart.currentStock,
          newStock: request.sparePart.currentStock - quantityDelivered,
          reason: 'Entrega para orden de trabajo',
          reference: request.workOrder.orderNumber,
        },
      }),
    ])

    return this.getById(request.sparePartId)
  }
}

export default new SparePartService()


