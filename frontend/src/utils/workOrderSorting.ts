import { WorkOrder } from '../services/workOrderService'

/**
 * Función de ordenamiento estándar para órdenes de trabajo
 * Ordena por:
 * 1. Prioridad (urgente > alta > normal > baja)
 * 2. Estado (pendiente > en_progreso > pausado > completado > cancelado)
 * 3. Fecha de creación (más recientes primero)
 */
export function sortWorkOrders(orders: WorkOrder[]): WorkOrder[] {
  const priorityOrder: Record<string, number> = {
    urgente: 0,
    alta: 1,
    normal: 2,
    baja: 3
  }

  const statusOrder: Record<string, number> = {
    pendiente: 0,
    en_progreso: 1,
    pausado: 2,
    completado: 3,
    cancelado: 4
  }

  return [...orders].sort((a, b) => {
    // Primero por prioridad
    const priorityDiff = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99)
    if (priorityDiff !== 0) return priorityDiff

    // Luego por estado
    const statusDiff = (statusOrder[a.currentStatus] ?? 99) - (statusOrder[b.currentStatus] ?? 99)
    if (statusDiff !== 0) return statusDiff

    // Finalmente por fecha de creación (más recientes primero)
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })
}

