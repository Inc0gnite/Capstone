import prisma from '../config/database'
import { validateLicensePlate } from '../utils/validation'
import type { VehicleFilters } from '../types'

/**
 * Servicio de vehículos
 */
export class VehicleService {
  /**
   * Obtener todos los vehículos con filtros y paginación
   */
  async getAll(filters: VehicleFilters) {
    const {
      page = 1,
      limit = 10,
      search = '',
      vehicleType,
      regionId,
      status,
      workshopId, // Agregar workshopId a los filtros
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters

    // Convertir a números para asegurar tipos correctos
    const pageNum = parseInt(page.toString())
    const limitNum = parseInt(limit.toString())
    const skip = (pageNum - 1) * limitNum

    // Construir where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { fleetNumber: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (vehicleType) where.vehicleType = vehicleType
    if (regionId) where.regionId = regionId
    if (status) where.status = status

    // Si hay workshopId, solo mostrar vehículos que tengan al menos una entrada en ese taller
    if (workshopId) {
      where.entries = {
        some: {
          workshopId: workshopId,
        },
      }
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          region: true,
          _count: {
            select: {
              entries: true,
              workOrders: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.vehicle.count({ where }),
    ])

    return {
      vehicles,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }
  }

  /**
   * Obtener vehículo por ID
   */
  async getById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        region: true,
        entries: {
          include: {
            workshop: true,
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { entryDate: 'desc' },
          take: 10,
        },
        workOrders: {
          include: {
            workshop: true,
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!vehicle) {
      throw new Error('Vehículo no encontrado')
    }

    return vehicle
  }

  /**
   * Obtener vehículo por patente
   */
  async getByLicensePlate(licensePlate: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { licensePlate: licensePlate.toUpperCase() },
      include: {
        region: true,
      },
    })

    if (!vehicle) {
      throw new Error('Vehículo no encontrado')
    }

    return vehicle
  }

  /**
   * Crear vehículo
   */
  async create(data: {
    licensePlate: string
    vehicleType: string
    brand: string
    model: string
    year: number
    vin?: string
    fleetNumber?: string
    regionId: string
  }) {
    const { licensePlate, vehicleType, brand, model, year, vin, fleetNumber, regionId } =
      data

    // Validar patente
    console.log('🔍 Validando patente:', licensePlate)
    if (!validateLicensePlate(licensePlate)) {
      console.log('❌ Patente inválida:', licensePlate)
      throw new Error('Formato de patente inválido')
    }
    console.log('✅ Patente válida:', licensePlate)

    // Verificar si ya existe un vehículo con esa patente
    console.log('🔍 Verificando si patente existe:', licensePlate.toUpperCase())
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { licensePlate: licensePlate.toUpperCase() },
    })

    if (existingVehicle) {
      console.log('❌ Patente ya existe:', licensePlate.toUpperCase())
      throw new Error('Ya existe un vehículo con esa patente')
    }
    console.log('✅ Patente disponible:', licensePlate.toUpperCase())

    // Verificar si la región existe
    console.log('🔍 Verificando región:', regionId)
    const region = await prisma.region.findUnique({
      where: { id: regionId },
    })

    if (!region) {
      console.log('❌ Región no encontrada:', regionId)
      throw new Error('Región no encontrada')
    }
    console.log('✅ Región encontrada:', region.name)

    // Validar que el año sea un número válido
    const yearNum = typeof year === 'string' ? parseInt(year, 10) : year
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      throw new Error(`Año inválido: ${year}. Debe ser un número entre 1900 y ${new Date().getFullYear() + 1}`)
    }

    // Convertir valores vacíos a undefined para campos opcionales
    const finalVIN = vin && vin.trim() !== '' ? vin : undefined
    const finalFleetNumber = fleetNumber && fleetNumber.trim() !== '' ? fleetNumber : undefined

    // Validar que el número de flota sea único (solo si se proporciona)
    if (finalFleetNumber) {
      console.log('🔍 Verificando si número de flota existe:', finalFleetNumber)
      const existingFleetNumber = await prisma.vehicle.findFirst({
        where: { 
          fleetNumber: finalFleetNumber,
          isActive: true, // Solo verificar vehículos activos
        },
      })

      if (existingFleetNumber) {
        console.log('❌ Número de flota ya existe:', finalFleetNumber)
        throw new Error(`Ya existe un vehículo con el número de flota ${finalFleetNumber}`)
      }
      console.log('✅ Número de flota disponible:', finalFleetNumber)
    }

    // Crear vehículo
    console.log('🚗 Creando vehículo con datos:', {
      licensePlate: licensePlate.toUpperCase(),
      vehicleType,
      brand,
      model,
      year: yearNum,
      vin: finalVIN,
      fleetNumber: finalFleetNumber,
      regionId,
    })
    
    const vehicle = await prisma.vehicle.create({
      data: {
        licensePlate: licensePlate.toUpperCase(),
        vehicleType,
        brand,
        model,
        year: yearNum,
        vin: finalVIN,
        fleetNumber: finalFleetNumber,
        regionId,
      },
      include: {
        region: true,
      },
    })

    console.log('✅ Vehículo creado exitosamente:', vehicle.id)
    return vehicle
  }

  /**
   * Actualizar vehículo
   */
  async update(id: string, data: Partial<{
    licensePlate: string
    vehicleType: string
    brand: string
    model: string
    year: number
    vin?: string
    fleetNumber?: string
    regionId: string
    status: string
    isActive: boolean
  }>) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    })

    if (!vehicle) {
      throw new Error('Vehículo no encontrado')
    }

    // Si se actualiza la patente, validarla y verificar que no exista
    if (data.licensePlate) {
      if (!validateLicensePlate(data.licensePlate)) {
        throw new Error('Formato de patente inválido')
      }

      const existingVehicle = await prisma.vehicle.findUnique({
        where: { licensePlate: data.licensePlate.toUpperCase() },
      })

      if (existingVehicle && existingVehicle.id !== id) {
        throw new Error('Ya existe un vehículo con esa patente')
      }

      data.licensePlate = data.licensePlate.toUpperCase()
    }

    // Si se actualiza el número de flota, validar que sea único
    if (data.fleetNumber !== undefined) {
      const finalFleetNumber = data.fleetNumber && data.fleetNumber.trim() !== '' ? data.fleetNumber.trim() : undefined
      
      if (finalFleetNumber) {
        console.log('🔍 Verificando si número de flota existe:', finalFleetNumber)
        const existingFleetNumber = await prisma.vehicle.findFirst({
          where: { 
            fleetNumber: finalFleetNumber,
            isActive: true, // Solo verificar vehículos activos
            id: { not: id }, // Excluir el vehículo actual
          },
        })

        if (existingFleetNumber) {
          console.log('❌ Número de flota ya existe:', finalFleetNumber)
          throw new Error(`Ya existe un vehículo con el número de flota ${finalFleetNumber}`)
        }
        console.log('✅ Número de flota disponible:', finalFleetNumber)
      }
      
      // Actualizar el valor en data
      data.fleetNumber = finalFleetNumber
    }

    // Actualizar vehículo
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data,
      include: {
        region: true,
      },
    })

    return updatedVehicle
  }

  /**
   * Eliminar vehículo (soft delete)
   */
  async softDelete(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    })

    if (!vehicle) {
      throw new Error('Vehículo no encontrado')
    }

    await prisma.vehicle.update({
      where: { id },
      data: { isActive: false, status: 'inactive' },
    })

    return { message: 'Vehículo eliminado exitosamente' }
  }

  /**
   * Restaurar vehículo
   */
  async restore(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    })

    if (!vehicle) {
      throw new Error('Vehículo no encontrado')
    }

    await prisma.vehicle.update({
      where: { id },
      data: { isActive: true, status: 'active' },
    })

    return { message: 'Vehículo restaurado exitosamente' }
  }

  /**
   * Obtener estadísticas de vehículos
   */
  async getStats() {
    const [total, active, inMaintenance, inactive, byType, byRegion] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'active' } }),
      prisma.vehicle.count({ where: { status: 'in_maintenance' } }),
      prisma.vehicle.count({ where: { status: 'inactive' } }),
      prisma.vehicle.groupBy({
        by: ['vehicleType'],
        _count: true,
      }),
      prisma.vehicle.groupBy({
        by: ['regionId'],
        _count: true,
      }),
    ])

    return {
      total,
      active,
      inMaintenance,
      inactive,
      byType,
      byRegion,
    }
  }

  /**
   * Eliminar vehículo permanentemente
   * Elimina en cascada todos los datos relacionados
   */
  async delete(id: string) {
    try {
      // Verificar que el vehículo existe
      const vehicle = await prisma.vehicle.findUnique({
        where: { id },
        include: {
          entries: {
            include: {
              workOrders: true
            }
          }
        }
      })

      if (!vehicle) {
        throw new Error('Vehículo no encontrado')
      }

      // Verificar si tiene ingresos activos
      const activeEntries = vehicle.entries.filter(entry => entry.status === 'ingresado')
      if (activeEntries.length > 0) {
        throw new Error('No se puede eliminar un vehículo con ingresos activos. Primero debe registrar la salida de todos los ingresos.')
      }

      // Eliminar en cascada usando transacción
      const result = await prisma.$transaction(async (tx) => {
        // 1. Eliminar fotos de órdenes de trabajo
        await tx.workOrderPhoto.deleteMany({
          where: {
            workOrder: {
              entry: {
                vehicleId: id
              }
            }
          }
        })

        // 2. Eliminar repuestos de órdenes de trabajo
        await tx.workOrderSparePart.deleteMany({
          where: {
            workOrder: {
              entry: {
                vehicleId: id
              }
            }
          }
        })

        // 3. Eliminar pausas de trabajo
        await tx.workPause.deleteMany({
          where: {
            workOrder: {
              entry: {
                vehicleId: id
              }
            }
          }
        })

        // 4. Eliminar estados de órdenes de trabajo
        await tx.workOrderStatus.deleteMany({
          where: {
            workOrder: {
              entry: {
                vehicleId: id
              }
            }
          }
        })

        // 5. Eliminar órdenes de trabajo
        await tx.workOrder.deleteMany({
          where: {
            entry: {
              vehicleId: id
            }
          }
        })

        // 6. Eliminar fotos de ingresos
        await tx.vehicleEntryPhoto.deleteMany({
          where: {
            entry: {
              vehicleId: id
            }
          }
        })

        // 7. Eliminar control de llaves
        await tx.keyControl.deleteMany({
          where: {
            entry: {
              vehicleId: id
            }
          }
        })

        // 8. Eliminar ingresos de vehículos
        await tx.vehicleEntry.deleteMany({
          where: {
            vehicleId: id
          }
        })

        // 9. Finalmente, eliminar el vehículo
        const deletedVehicle = await tx.vehicle.delete({
          where: { id }
        })

        return deletedVehicle
      })

      return result
    } catch (error: any) {
      console.error('Error eliminando vehículo:', error)
      throw new Error(error.message || 'Error eliminando vehículo')
    }
  }
}

export default new VehicleService()


