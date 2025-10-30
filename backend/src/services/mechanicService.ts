import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface MechanicWorkload {
  mechanicId: string
  mechanicName: string
  activeOrders: number
  inProgressOrders: number
  pendingOrders: number
  maxCapacity: number
  efficiency: number
  specialties: string[]
  isAvailable: boolean
  currentHours: number
  maxHours: number
  estimatedHours?: number // Horas de la orden que se está asignando
}

export interface AssignMechanicRequest {
  workOrderId: string
  mechanicId: string
  notes?: string
}

export class MechanicService {
  /**
   * Obtener mecánicos disponibles por taller
   */
  async getAvailableMechanics(workshopId: string): Promise<MechanicWorkload[]> {
    try {
      // Obtener mecánicos del taller con sus órdenes activas
      const mechanics = await prisma.user.findMany({
        where: {
          role: {
            name: 'Mecánico'
          },
          workshopId: workshopId,
          isActive: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          assignedWorkOrders: {
            where: {
              currentStatus: {
                in: ['pendiente', 'en_progreso', 'pausado'] // Solo órdenes no completadas
              }
            },
            select: {
              id: true,
              currentStatus: true,
              estimatedHours: true,
              totalHours: true,
              completedAt: true
            }
          }
        }
      })

      // Calcular carga de trabajo y disponibilidad por horas
      const mechanicsWithWorkload = mechanics.map(mechanic => {
        const activeOrders = mechanic.assignedWorkOrders.length
        const maxCapacity = 5 // Capacidad máxima por mecánico
        
        // Separar órdenes en progreso y pendientes
        const inProgressOrders = mechanic.assignedWorkOrders.filter(
          order => order.currentStatus === 'en_progreso'
        )
        const pendingOrders = mechanic.assignedWorkOrders.filter(
          order => order.currentStatus === 'pendiente' || order.currentStatus === 'pausado'
        )
        
        // Calcular horas actuales sumando estimatedHours de órdenes activas
        const currentHours = mechanic.assignedWorkOrders.reduce(
          (sum, order) => sum + (order.estimatedHours || 0), 0
        )
        const maxHours = 8 // Límite máximo de horas por día
        
        // Calcular eficiencia basada en órdenes completadas
        const completedOrders = mechanic.assignedWorkOrders.filter(
          order => order.currentStatus === 'completado'
        ).length
        const efficiency = completedOrders > 0 ? Math.min(95, (completedOrders / (completedOrders + activeOrders)) * 100) : 85

        // Disponible si: 
        // 1. Tiene menos de 8 horas asignadas
        // 2. NO tiene una orden en progreso (solo una tarea a la vez)
        const isAvailable = currentHours < maxHours && inProgressOrders.length === 0

        return {
          mechanicId: mechanic.id,
          mechanicName: `${mechanic.firstName} ${mechanic.lastName}`,
          activeOrders,
          inProgressOrders: inProgressOrders.length,
          pendingOrders: pendingOrders.length,
          maxCapacity,
          efficiency: Math.round(efficiency),
          specialties: ['General', 'Motor', 'Frenos'], // Especialidades por defecto
          isAvailable,
          currentHours: Math.round(currentHours * 100) / 100,
          maxHours
        }
      })

      // Retornar todos los mecánicos con su información
      return mechanicsWithWorkload
    } catch (error) {
      console.error('Error obteniendo mecánicos disponibles:', error)
      throw new Error('Error obteniendo mecánicos disponibles')
    }
  }

  /**
   * Asignar mecánico a orden de trabajo
   */
  async assignMechanicToOrder(assignment: AssignMechanicRequest): Promise<void> {
    try {
      // Verificar que la orden existe
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: assignment.workOrderId },
        select: { 
          id: true, 
          currentStatus: true, 
          estimatedHours: true,
          scheduledDate: true,
          workshopId: true
        }
      })

      if (!workOrder) {
        throw new Error('Orden de trabajo no encontrada')
      }

      // Verificar que el mecánico existe y es un mecánico
      const mechanic = await prisma.user.findFirst({
        where: { 
          id: assignment.mechanicId,
          role: {
            name: 'Mecánico'
          }
        },
        select: { id: true }
      })

      if (!mechanic) {
        throw new Error('Mecánico no encontrado o no válido')
      }

      // Validar capacidad de horas del mecánico
      const maxHours = 8
      const activeOrders = await prisma.workOrder.findMany({
        where: {
          assignedToId: assignment.mechanicId,
          currentStatus: { in: ['pendiente', 'en_progreso', 'pausado'] },
          NOT: { id: assignment.workOrderId } // Excluir la orden actual
        },
        select: { estimatedHours: true, scheduledDate: true }
      })

      const currentHours = activeOrders.reduce((sum, order) => 
        sum + (order.estimatedHours || 0), 0
      )

      if (currentHours + (workOrder.estimatedHours || 0) >= maxHours) {
        const mechanicInfo = await prisma.user.findUnique({
          where: { id: assignment.mechanicId },
          select: { firstName: true, lastName: true }
        })
        const mechanicName = mechanicInfo ? `${mechanicInfo.firstName} ${mechanicInfo.lastName}` : 'El mecánico'
        
        throw new Error(
          `${mechanicName} no puede recibir esta orden porque excedería su límite de ${maxHours}h por día. ` +
          `Actualmente tiene ${currentHours}h asignadas y esta orden requiere ${workOrder.estimatedHours || 0}h.`
        )
      }

      // Actualizar la orden con el mecánico asignado (mantener estado pendiente)
      await prisma.workOrder.update({
        where: { id: assignment.workOrderId },
        data: {
          assignedToId: assignment.mechanicId,
          // NO cambiar el estado a 'en_progreso' - debe quedarse en 'pendiente'
          // El mecánico iniciará la orden manualmente cuando esté listo
          updatedAt: new Date()
        }
      })

      // Crear registro de asignación en el historial de estados si hay notas
      if (assignment.notes) {
        await prisma.workOrderStatus.create({
          data: {
            workOrderId: assignment.workOrderId,
            status: 'pendiente', // Estado actual después de asignar mecánico
            observations: `Mecánico asignado. Notas: ${assignment.notes}`,
            changedById: assignment.mechanicId
          }
        })
      }

    } catch (error) {
      console.error('Error asignando mecánico:', error)
      throw new Error('Error asignando mecánico a la orden')
    }
  }

  /**
   * Reasignar mecánico a orden de trabajo
   */
  async reassignMechanicToOrder(assignment: AssignMechanicRequest): Promise<void> {
    try {
      // Verificar que la orden existe y tiene mecánico asignado
      const workOrder = await prisma.workOrder.findUnique({
        where: { id: assignment.workOrderId },
        select: { 
          id: true, 
          currentStatus: true,
          assignedToId: true
        }
      })

      if (!workOrder) {
        throw new Error('Orden de trabajo no encontrada')
      }

      if (!workOrder.assignedToId) {
        throw new Error('La orden no tiene mecánico asignado para reasignar')
      }

      // Verificar que el nuevo mecánico existe
      const mechanic = await prisma.user.findUnique({
        where: { id: assignment.mechanicId },
        select: { id: true, role: { select: { name: true } } }
      })

      if (!mechanic || mechanic.role?.name !== 'Mecánico') {
        throw new Error('Mecánico no encontrado o no válido')
      }

      // Actualizar la orden con el nuevo mecánico
      await prisma.workOrder.update({
        where: { id: assignment.workOrderId },
        data: {
          assignedToId: assignment.mechanicId,
          updatedAt: new Date()
        }
      })

      // Crear registro de reasignación
      await prisma.workOrderStatus.create({
        data: {
          workOrderId: assignment.workOrderId,
          status: 'en_progreso',
          observations: `Mecánico reasignado a: ${assignment.mechanicId}. Notas: ${assignment.notes || 'Sin notas'}`,
          changedById: assignment.mechanicId
        }
      })

    } catch (error) {
      console.error('Error reasignando mecánico:', error)
      throw new Error('Error reasignando mecánico a la orden')
    }
  }

  /**
   * Obtener carga de trabajo de un mecánico específico
   */
  async getMechanicWorkload(mechanicId: string): Promise<MechanicWorkload> {
    try {
      const mechanic = await prisma.user.findUnique({
        where: { id: mechanicId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          assignedWorkOrders: {
            where: {
              currentStatus: {
                in: ['pendiente', 'en_progreso', 'pausado']
              }
            },
            select: {
              id: true,
              currentStatus: true,
              estimatedHours: true
            }
          }
        }
      })

      if (!mechanic) {
        throw new Error('Mecánico no encontrado')
      }

      // Separar órdenes en progreso y pendientes
      const inProgressOrders = mechanic.assignedWorkOrders.filter(
        order => order.currentStatus === 'en_progreso'
      )
      const pendingOrders = mechanic.assignedWorkOrders.filter(
        order => order.currentStatus === 'pendiente' || order.currentStatus === 'pausado'
      )
      
      const activeOrders = mechanic.assignedWorkOrders.length
      const maxCapacity = 5
      const currentHours = mechanic.assignedWorkOrders.reduce(
        (sum, order) => sum + (order.estimatedHours || 0), 0
      )
      const maxHours = 8
      
      // Disponible si tiene menos de 8 horas y NO tiene orden en progreso
      const isAvailable = currentHours < maxHours && inProgressOrders.length === 0

      return {
        mechanicId: mechanic.id,
        mechanicName: `${mechanic.firstName} ${mechanic.lastName}`,
        activeOrders,
        inProgressOrders: inProgressOrders.length,
        pendingOrders: pendingOrders.length,
        maxCapacity,
        efficiency: 85, // Eficiencia por defecto
        specialties: ['General', 'Motor', 'Frenos'],
        isAvailable,
        currentHours: Math.round(currentHours * 100) / 100,
        maxHours
      }
    } catch (error) {
      console.error('Error obteniendo carga de trabajo:', error)
      throw new Error('Error obteniendo carga de trabajo del mecánico')
    }
  }

  /**
   * Obtener mecánicos por especialidad
   */
  async getMechanicsBySpecialty(workshopId: string, _specialty: string): Promise<any[]> {
    try {
      // Por ahora retornamos todos los mecánicos ya que no tenemos especialidades en la BD
      const mechanics = await prisma.user.findMany({
        where: {
          role: {
            name: 'Mecánico'
          },
          workshopId: workshopId,
          isActive: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      })

      return mechanics.map(mechanic => ({
        id: mechanic.id,
        name: `${mechanic.firstName} ${mechanic.lastName}`,
        email: mechanic.email,
        specialties: ['General', 'Motor', 'Frenos']
      }))
    } catch (error) {
      console.error('Error obteniendo mecánicos por especialidad:', error)
      throw new Error('Error obteniendo mecánicos por especialidad')
    }
  }

  /**
   * Obtener mecánicos con carga de trabajo por taller
   */
  async getMechanicsWithWorkload(workshopId: string): Promise<any[]> {
    try {
      // Obtener todos los mecánicos del taller con sus órdenes activas
      const mechanics = await prisma.user.findMany({
        where: {
          role: {
            name: 'Mecánico'
          },
          workshopId: workshopId,
          isActive: true
        },
        include: {
          assignedWorkOrders: {
            where: {
              currentStatus: {
                in: ['pendiente', 'en_progreso', 'pausado']
              }
            },
            include: {
              vehicle: true
            }
          }
        }
      })

      return mechanics.map(mechanic => ({
        id: mechanic.id,
        firstName: mechanic.firstName,
        lastName: mechanic.lastName,
        email: mechanic.email,
        phone: mechanic.phone,
        isActive: mechanic.isActive,
        currentWorkload: mechanic.assignedWorkOrders.length,
        maxWorkload: 5, // Capacidad máxima por defecto
        currentOrders: mechanic.assignedWorkOrders.map(order => ({
          id: order.id,
          orderNumber: order.orderNumber,
          vehiclePlate: order.vehicle?.licensePlate || 'N/A',
          priority: order.priority
        }))
      }))
    } catch (error) {
      console.error('Error obteniendo mecánicos con carga de trabajo:', error)
      throw new Error('Error obteniendo mecánicos con carga de trabajo')
    }
  }

  /**
   * Intercambiar órdenes de trabajo entre mecánicos
   */
  async exchangeMechanics(data: {
    workOrderId: string
    fromMechanicId: string
    toMechanicId: string
    orderToExchangeId: string
  }): Promise<void> {
    try {
      const { workOrderId, fromMechanicId, toMechanicId, orderToExchangeId } = data

      // Verificar que la orden actual existe y tiene el mecánico correcto
      const currentOrder = await prisma.workOrder.findUnique({
        where: { id: workOrderId },
        include: { assignedTo: true }
      })

      if (!currentOrder) {
        throw new Error('Orden de trabajo actual no encontrada')
      }

      if (currentOrder.assignedToId !== fromMechanicId) {
        throw new Error('El mecánico actual no coincide con el especificado')
      }

      // Verificar que la orden a intercambiar existe y tiene el mecánico correcto
      const orderToExchange = await prisma.workOrder.findUnique({
        where: { id: orderToExchangeId },
        include: { assignedTo: true }
      })

      if (!orderToExchange) {
        throw new Error('Orden de trabajo a intercambiar no encontrada')
      }

      if (orderToExchange.assignedToId !== toMechanicId) {
        throw new Error('La orden a intercambiar no está asignada al mecánico seleccionado')
      }

      // Verificar que el mecánico de destino existe
      const toMechanic = await prisma.user.findUnique({
        where: { id: toMechanicId }
      })

      if (!toMechanic) {
        throw new Error('Mecánico de destino no encontrado')
      }

      // Validar capacidad de horas para ambos mecánicos
      const maxHours = 8

      // Validar para el mecánico de destino (quien recibirá la orden actual)
      const toMechanicOrders = await prisma.workOrder.findMany({
        where: {
          assignedToId: toMechanicId,
          currentStatus: { in: ['pendiente', 'en_progreso', 'pausado'] },
          NOT: { id: orderToExchangeId } // Excluir la orden que se va a intercambiar
        },
        select: { estimatedHours: true, scheduledDate: true }
      })

      const toMechanicCurrentHours = toMechanicOrders.reduce((sum, order) => 
        sum + (order.estimatedHours || 0), 0
      )

      if (toMechanicCurrentHours + (currentOrder.estimatedHours || 0) >= maxHours) {
        throw new Error(
          `El mecánico de destino ${toMechanic.firstName} ${toMechanic.lastName} no puede recibir la orden ` +
          `porque excedería su límite de ${maxHours}h. Actualmente tiene ${toMechanicCurrentHours}h asignadas.`
        )
      }

      // Validar para el mecánico actual (quien recibirá la orden a intercambiar)
      const fromMechanicOrders = await prisma.workOrder.findMany({
        where: {
          assignedToId: fromMechanicId,
          currentStatus: { in: ['pendiente', 'en_progreso', 'pausado'] },
          NOT: { id: workOrderId } // Excluir la orden actual
        },
        select: { estimatedHours: true, scheduledDate: true }
      })

      const fromMechanicCurrentHours = fromMechanicOrders.reduce((sum, order) => 
        sum + (order.estimatedHours || 0), 0
      )

      if (fromMechanicCurrentHours + (orderToExchange.estimatedHours || 0) >= maxHours) {
        const fromMechanic = await prisma.user.findUnique({
          where: { id: fromMechanicId },
          select: { firstName: true, lastName: true }
        })
        const fromMechanicName = fromMechanic ? `${fromMechanic.firstName} ${fromMechanic.lastName}` : 'el mecánico'
        
        throw new Error(
          `${fromMechanicName} no puede recibir la orden a intercambiar ` +
          `porque excedería su límite de ${maxHours}h. Actualmente tiene ${fromMechanicCurrentHours}h asignadas.`
        )
      }

      // Realizar el intercambio en una transacción
      await prisma.$transaction(async (tx) => {
        // Asignar la orden actual al mecánico de destino
        await tx.workOrder.update({
          where: { id: workOrderId },
          data: {
            assignedToId: toMechanicId,
            updatedAt: new Date()
          }
        })

        // Asignar la orden a intercambiar al mecánico actual
        await tx.workOrder.update({
          where: { id: orderToExchangeId },
          data: {
            assignedToId: fromMechanicId,
            updatedAt: new Date()
          }
        })

        // Crear registro de cambio de estado para la orden actual
        await tx.workOrderStatus.create({
          data: {
            workOrderId: workOrderId,
            status: currentOrder.currentStatus,
            observations: `Orden intercambiada y asignada a ${toMechanic.firstName} ${toMechanic.lastName}`,
            changedById: fromMechanicId
          }
        })

        // Crear registro de cambio de estado para la orden intercambiada
        await tx.workOrderStatus.create({
          data: {
            workOrderId: orderToExchangeId,
            status: orderToExchange.currentStatus,
            observations: `Orden intercambiada y asignada al mecánico actual`,
            changedById: fromMechanicId
          }
        })
      })

      console.log(`Órdenes intercambiadas exitosamente entre mecánicos`)
    } catch (error) {
      console.error('Error intercambiando órdenes:', error)
      throw new Error('Error intercambiando órdenes entre mecánicos')
    }
  }
}

export const mechanicService = new MechanicService()
