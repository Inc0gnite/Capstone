import prisma from '../config/database'

/**
 * Servicio para manejar contadores secuenciales
 */
export class CounterService {
  /**
   * Obtener el siguiente número secuencial para un contador
   */
  async getNextNumber(counterName: string, prefix?: string, suffix?: string): Promise<string> {
    try {
      // Usar transacción para evitar condiciones de carrera
      const result = await prisma.$transaction(async (tx) => {
        // Buscar o crear el contador
        let counter = await tx.counter.findUnique({
          where: { name: counterName }
        })

        if (!counter) {
          // Crear nuevo contador
          counter = await tx.counter.create({
            data: {
              name: counterName,
              value: 0,
              prefix: prefix || '',
              suffix: suffix || ''
            }
          })
        }

        // Incrementar el contador
        const updatedCounter = await tx.counter.update({
          where: { id: counter.id },
          data: { value: counter.value + 1 }
        })

        return updatedCounter
      })

      // Formatear el número con prefijo y sufijo
      const paddedNumber = result.value.toString().padStart(4, '0')
      return `${result.prefix || ''}${paddedNumber}${result.suffix || ''}`
    } catch (error) {
      console.error('Error obteniendo siguiente número:', error)
      throw new Error('Error generando número secuencial')
    }
  }

  /**
   * Obtener el siguiente número para órdenes de trabajo
   */
  async getNextWorkOrderNumber(): Promise<string> {
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    
    const counterName = `work-orders-${year}${month}${day}`
    const prefix = `OT-${year}${month}${day}-`
    
    return this.getNextNumber(counterName, prefix)
  }

  /**
   * Obtener el siguiente número para entradas de vehículos
   */
  async getNextEntryNumber(): Promise<string> {
    const today = new Date()
    const year = today.getFullYear()
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const day = today.getDate().toString().padStart(2, '0')
    
    const counterName = `entries-${year}${month}${day}`
    const prefix = `ING-${year}${month}${day}-`
    
    return this.getNextNumber(counterName, prefix)
  }

  /**
   * Reiniciar contador (útil para testing)
   */
  async resetCounter(counterName: string): Promise<void> {
    await prisma.counter.updateMany({
      where: { name: counterName },
      data: { value: 0 }
    })
  }

  /**
   * Obtener valor actual del contador
   */
  async getCurrentValue(counterName: string): Promise<number> {
    const counter = await prisma.counter.findUnique({
      where: { name: counterName }
    })
    return counter?.value || 0
  }
}

export const counterService = new CounterService()








