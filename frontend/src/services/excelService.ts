import * as XLSX from 'xlsx'

export class ExcelService {
  /**
   * Exporta los datos del reporte a Excel
   */
  static exportReportsToExcel(data: {
    kpis?: {
      total: number
      pendientes: number
      en_progreso: number
      pausados: number
      completados: number
      cancelados: number
      completadosHoy: number
    }
    mechanicsPerformance?: Array<{
      id: string
      name: string
      totalOrders: number
      inProgressOrders: number
      completedOrders: number
      totalHours: number
      averageHours: number
    }>
    recentOrders?: Array<{
      id: string
      orderNumber: string
      currentStatus: string
      vehicle?: { licensePlate: string }
      workType: string
      priority: string
      description?: string
      createdAt?: string
    }>
    lowStockParts?: Array<{
      id: string
      code: string
      name: string
      category: string
      currentStock: number
      minStock: number
    }>
  }): void {
    const workbook = XLSX.utils.book_new()

    // Hoja 1: KPIs
    if (data.kpis) {
      const kpisData = [
        ['Indicador', 'Valor'],
        ['Total de Órdenes', data.kpis.total],
        ['Pendientes', data.kpis.pendientes],
        ['En Progreso', data.kpis.en_progreso],
        ['Pausadas', data.kpis.pausados],
        ['Completadas', data.kpis.completados],
        ['Canceladas', data.kpis.cancelados],
        ['Completadas Hoy', data.kpis.completadosHoy],
      ]
      const kpisSheet = XLSX.utils.aoa_to_sheet(kpisData)
      XLSX.utils.book_append_sheet(workbook, kpisSheet, 'Indicadores')
    }

    // Hoja 2: Rendimiento de Mecánicos
    if (data.mechanicsPerformance && data.mechanicsPerformance.length > 0) {
      const mechanicsData = [
        ['Mecánico', 'Total Órdenes', 'En Progreso', 'Completadas', 'Horas Totales', 'Promedio (h)'],
        ...data.mechanicsPerformance.map((m) => [
          m.name,
          m.totalOrders,
          m.inProgressOrders,
          m.completedOrders,
          m.totalHours,
          m.averageHours,
        ]),
      ]
      const mechanicsSheet = XLSX.utils.aoa_to_sheet(mechanicsData)
      XLSX.utils.book_append_sheet(workbook, mechanicsSheet, 'Rendimiento Mecánicos')
    }

    // Hoja 3: Órdenes Recientes
    if (data.recentOrders && data.recentOrders.length > 0) {
      const ordersData = [
        ['Número Orden', 'Patente', 'Tipo Trabajo', 'Estado', 'Prioridad', 'Descripción', 'Fecha Creación'],
        ...data.recentOrders.map((o) => [
          o.orderNumber,
          o.vehicle?.licensePlate || 'N/A',
          o.workType,
          o.currentStatus,
          o.priority,
          o.description || '',
          o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-CL') : '',
        ]),
      ]
      const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData)
      XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Órdenes Recientes')
    }

    // Hoja 4: Repuestos con Bajo Stock
    if (data.lowStockParts && data.lowStockParts.length > 0) {
      const partsData = [
        ['Código', 'Nombre', 'Categoría', 'Stock Actual', 'Stock Mínimo'],
        ...data.lowStockParts.map((p) => [
          p.code,
          p.name,
          p.category || 'Sin categoría',
          p.currentStock,
          p.minStock,
        ]),
      ]
      const partsSheet = XLSX.utils.aoa_to_sheet(partsData)
      XLSX.utils.book_append_sheet(workbook, partsSheet, 'Repuestos Bajo Stock')
    }

    // Generar nombre del archivo con fecha
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0]
    const fileName = `Reporte_${dateStr}.xlsx`

    // Descargar el archivo
    XLSX.writeFile(workbook, fileName)
  }
}

