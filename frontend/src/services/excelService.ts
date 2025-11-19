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
    allOrders?: Array<{
      id: string
      orderNumber: string
      currentStatus: string
      vehicle?: { licensePlate: string; brand?: string; model?: string; year?: number }
      entry?: { entryCode: string; driverName: string; driverRut: string }
      assignedTo?: { firstName: string; lastName: string; email: string }
      workType: string
      priority: string
      description?: string
      observations?: string
      progress?: number
      estimatedHours?: number
      totalHours?: number
      createdAt?: string
      startedAt?: string
      completedAt?: string
    }>
    allParts?: Array<{
      id: string
      code: string
      name: string
      category: string
      description?: string
      currentStock: number
      minStock: number
      maxStock?: number
      unitPrice?: number
      location?: string
      isActive: boolean
    }>
    allVehicles?: Array<{
      id: string
      licensePlate: string
      vehicleType: string
      brand: string
      model?: string
      year: number
      vin?: string
      fleetNumber?: string
      status?: string
      region?: { name: string }
    }>
    allEntries?: Array<{
      id: string
      entryCode: string
      vehicle?: { licensePlate: string }
      driverName: string
      driverRut: string
      driverPhone?: string
      entryDate: string
      entryTime?: string
      entryKm: number
      fuelLevel: string
      status: string
      observations?: string
      exitKm?: number
      exitDate?: string
      exitTime?: string
    }>
    allUsers?: Array<{
      id: string
      rut: string
      firstName: string
      lastName: string
      email: string
      phone?: string
      isActive: boolean
      role?: { name: string }
      workshop?: { name: string }
      createdAt: string
    }>
    allMechanics?: Array<{
      id: string
      rut: string
      firstName: string
      lastName: string
      email: string
      phone?: string
      isActive: boolean
      role?: { name: string }
      workshop?: { name: string }
      createdAt: string
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

    // Hoja 3: TODAS las Órdenes de Trabajo (ordenadas por fecha de creación descendente)
    if (data.allOrders && data.allOrders.length > 0) {
      const sortedOrders = [...data.allOrders].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA // Orden descendente
      })
      
      const ordersData = [
        ['Número Orden', 'Patente', 'Marca', 'Modelo', 'Año', 'Código Ingreso', 'Conductor', 'RUT Conductor', 'Mecánico', 'Tipo Trabajo', 'Estado', 'Prioridad', 'Progreso %', 'Horas Estimadas', 'Horas Totales', 'Descripción', 'Observaciones', 'Fecha Creación', 'Fecha Inicio', 'Fecha Completado'],
        ...sortedOrders.map((o) => [
          o.orderNumber,
          o.vehicle?.licensePlate || 'N/A',
          o.vehicle?.brand || 'N/A',
          o.vehicle?.model || 'N/A',
          o.vehicle?.year || 'N/A',
          o.entry?.entryCode || 'N/A',
          o.entry?.driverName || 'N/A',
          o.entry?.driverRut || 'N/A',
          o.assignedTo ? `${o.assignedTo.firstName} ${o.assignedTo.lastName}` : 'Sin asignar',
          o.workType,
          o.currentStatus,
          o.priority,
          o.progress || 0,
          o.estimatedHours || 0,
          o.totalHours || 0,
          o.description || '',
          o.observations || '',
          o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-CL') : '',
          o.startedAt ? new Date(o.startedAt).toLocaleDateString('es-CL') : '',
          o.completedAt ? new Date(o.completedAt).toLocaleDateString('es-CL') : '',
        ]),
      ]
      const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData)
      XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Órdenes de Trabajo')
    }

    // Hoja 4: TODOS los Repuestos (ordenados por código)
    if (data.allParts && data.allParts.length > 0) {
      const sortedParts = [...data.allParts].sort((a, b) => {
        return (a.code || '').localeCompare(b.code || '')
      })
      
      const partsData = [
        ['Código', 'Nombre', 'Categoría', 'Descripción', 'Stock Actual', 'Stock Mínimo', 'Stock Máximo', 'Precio Unitario', 'Ubicación', 'Activo'],
        ...sortedParts.map((p) => [
          p.code,
          p.name,
          p.category || 'Sin categoría',
          p.description || '',
          p.currentStock,
          p.minStock,
          p.maxStock || 0,
          typeof p.unitPrice === 'number' ? p.unitPrice : 0,
          p.location || '',
          p.isActive ? 'Sí' : 'No',
        ]),
      ]
      const partsSheet = XLSX.utils.aoa_to_sheet(partsData)
      XLSX.utils.book_append_sheet(workbook, partsSheet, 'Repuestos')
    }

    // Hoja 5: TODOS los Vehículos (ordenados por patente)
    if (data.allVehicles && data.allVehicles.length > 0) {
      const sortedVehicles = [...data.allVehicles].sort((a, b) => {
        return (a.licensePlate || '').localeCompare(b.licensePlate || '')
      })
      
      const vehiclesData = [
        ['Patente', 'Tipo', 'Marca', 'Modelo', 'Año', 'VIN', 'Número Flota', 'Región', 'Estado'],
        ...sortedVehicles.map((v) => [
          v.licensePlate,
          v.vehicleType,
          v.brand,
          v.model || '',
          v.year,
          v.vin || '',
          v.fleetNumber || '',
          v.region?.name || '',
          v.status || 'N/A',
        ]),
      ]
      const vehiclesSheet = XLSX.utils.aoa_to_sheet(vehiclesData)
      XLSX.utils.book_append_sheet(workbook, vehiclesSheet, 'Vehículos')
    }

    // Hoja 6: TODOS los Ingresos de Vehículos (ordenados por fecha descendente)
    if (data.allEntries && data.allEntries.length > 0) {
      const sortedEntries = [...data.allEntries].sort((a, b) => {
        const dateA = a.entryDate ? new Date(a.entryDate).getTime() : 0
        const dateB = b.entryDate ? new Date(b.entryDate).getTime() : 0
        return dateB - dateA // Orden descendente
      })
      
      const entriesData = [
        ['Código Ingreso', 'Patente', 'Conductor', 'RUT Conductor', 'Teléfono', 'Fecha Ingreso', 'Hora Ingreso', 'Kilometraje Ingreso', 'Nivel Combustible', 'Estado', 'Kilometraje Salida', 'Fecha Salida', 'Hora Salida', 'Observaciones'],
        ...sortedEntries.map((e) => [
          e.entryCode,
          e.vehicle?.licensePlate || 'N/A',
          e.driverName,
          e.driverRut,
          e.driverPhone || '',
          e.entryDate ? new Date(e.entryDate).toLocaleDateString('es-CL') : '',
          e.entryTime || '',
          e.entryKm,
          e.fuelLevel,
          e.status,
          e.exitKm || '',
          e.exitDate ? new Date(e.exitDate).toLocaleDateString('es-CL') : '',
          e.exitTime || '',
          e.observations || '',
        ]),
      ]
      const entriesSheet = XLSX.utils.aoa_to_sheet(entriesData)
      XLSX.utils.book_append_sheet(workbook, entriesSheet, 'Ingresos de Vehículos')
    }

    // Hoja 7: MECÁNICOS (ordenados por nombre)
    if (data.allMechanics && data.allMechanics.length > 0) {
      const sortedMechanics = [...data.allMechanics].sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })
      
      const mechanicsData = [
        ['RUT', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Taller', 'Estado', 'Fecha Creación'],
        ...sortedMechanics.map((m) => [
          m.rut,
          m.firstName,
          m.lastName,
          m.email,
          m.phone || '',
          m.workshop?.name || 'Sin taller',
          m.isActive ? 'Activo' : 'Inactivo',
          m.createdAt ? new Date(m.createdAt).toLocaleDateString('es-CL') : '',
        ]),
      ]
      const mechanicsSheet = XLSX.utils.aoa_to_sheet(mechanicsData)
      XLSX.utils.book_append_sheet(workbook, mechanicsSheet, 'Mecánicos')
    }

    // Hoja 8: TODOS los Usuarios (ordenados por nombre)
    if (data.allUsers && data.allUsers.length > 0) {
      const sortedUsers = [...data.allUsers].sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase()
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })
      
      const usersData = [
        ['RUT', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Rol', 'Taller', 'Activo', 'Fecha Creación'],
        ...sortedUsers.map((u) => [
          u.rut,
          u.firstName,
          u.lastName,
          u.email,
          u.phone || '',
          u.role?.name || 'Sin rol',
          u.workshop?.name || 'Sin taller',
          u.isActive ? 'Sí' : 'No',
          u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CL') : '',
        ]),
      ]
      const usersSheet = XLSX.utils.aoa_to_sheet(usersData)
      XLSX.utils.book_append_sheet(workbook, usersSheet, 'Usuarios')
    }

    // Generar nombre del archivo con fecha
    const date = new Date()
    const dateStr = date.toISOString().split('T')[0]
    const fileName = `Reporte_${dateStr}.xlsx`

    // Descargar el archivo
    XLSX.writeFile(workbook, fileName)
  }

  /**
   * Exporta el reporte de flota a Excel
   */
  static exportFleetReportToExcel(report: {
    summary: {
      totalVehicles: number
      totalEntries: number
      totalWorkOrders: number
      averageCompletionTime: number
      dateFrom: string | null
      dateTo: string | null
      regionId: string | null
    }
    byRegion: Array<{
      regionName: string
      regionCode: string
      vehicleCount: number
      entryCount: number
      workOrderCount: number
    }>
    byVehicleType: Array<{
      vehicleType: string
      count: number
    }>
    vehicles: Array<any>
  }, regionName?: string): void {
    const workbook = XLSX.utils.book_new()

    // Hoja 1: Resumen
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Total Vehículos', report.summary.totalVehicles],
      ['Total Ingresos', report.summary.totalEntries],
      ['Total Órdenes', report.summary.totalWorkOrders],
      ['Tiempo Promedio (h)', report.summary.averageCompletionTime.toFixed(2)],
      ['Fecha Desde', report.summary.dateFrom || 'N/A'],
      ['Fecha Hasta', report.summary.dateTo || 'N/A'],
      ['Región', regionName || 'Todas'],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')

    // Hoja 2: Por Región
    if (report.byRegion.length > 0) {
      const regionData = [
        ['Región', 'Código', 'Vehículos', 'Ingresos', 'Órdenes'],
        ...report.byRegion.map((r) => [
          r.regionName,
          r.regionCode,
          r.vehicleCount,
          r.entryCount,
          r.workOrderCount,
        ]),
      ]
      const regionSheet = XLSX.utils.aoa_to_sheet(regionData)
      XLSX.utils.book_append_sheet(workbook, regionSheet, 'Por Región')
    }

    // Hoja 3: Por Tipo de Vehículo
    if (report.byVehicleType.length > 0) {
      const vehicleTypeData = [
        ['Tipo de Vehículo', 'Cantidad'],
        ...report.byVehicleType.map((v) => [v.vehicleType, v.count]),
      ]
      const vehicleTypeSheet = XLSX.utils.aoa_to_sheet(vehicleTypeData)
      XLSX.utils.book_append_sheet(workbook, vehicleTypeSheet, 'Por Tipo')
    }

    // Hoja 4: Vehículos
    if (report.vehicles.length > 0) {
      const vehiclesData = [
        ['Patente', 'Tipo', 'Marca', 'Modelo', 'Año', 'Número Flota', 'Región', 'Total Ingresos', 'Total Órdenes'],
        ...report.vehicles.map((v) => [
          v.licensePlate,
          v.vehicleType,
          v.brand,
          v.model,
          v.year,
          v.fleetNumber || '',
          v.region?.name || '',
          v.totalEntries,
          v.totalWorkOrders,
        ]),
      ]
      const vehiclesSheet = XLSX.utils.aoa_to_sheet(vehiclesData)
      XLSX.utils.book_append_sheet(workbook, vehiclesSheet, 'Vehículos')
    }

    const date = new Date().toISOString().split('T')[0]
    const fileName = `Reporte_Flota_${date}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  /**
   * Exporta el reporte de desempeño de mecánicos a Excel
   */
  static exportMechanicsPerformanceReportToExcel(report: {
    summary: {
      totalMechanics: number
      totalOrders: number
      totalCompleted: number
      totalHours: number
      averageEfficiency: number
      dateFrom: string | null
      dateTo: string | null
    }
    mechanics: Array<{
      name: string
      email: string
      workshop: { name: string } | null
      totalOrders: number
      completedOrders: number
      inProgressOrders: number
      pendingOrders: number
      pausedOrders: number
      cancelledOrders: number
      totalHours: number
      estimatedHours: number
      averageHours: number
      efficiency: number
      averageCompletionDays: number
    }>
  }): void {
    const workbook = XLSX.utils.book_new()

    // Hoja 1: Resumen
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Total Mecánicos', report.summary.totalMechanics],
      ['Total Órdenes', report.summary.totalOrders],
      ['Órdenes Completadas', report.summary.totalCompleted],
      ['Total Horas', report.summary.totalHours.toFixed(2)],
      ['Eficiencia Promedio', `${report.summary.averageEfficiency.toFixed(1)}%`],
      ['Fecha Desde', report.summary.dateFrom || 'N/A'],
      ['Fecha Hasta', report.summary.dateTo || 'N/A'],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')

    // Hoja 2: Mecánicos
    if (report.mechanics.length > 0) {
      const mechanicsData = [
        [
          'Mecánico',
          'Email',
          'Taller',
          'Total Órdenes',
          'Completadas',
          'En Progreso',
          'Pendientes',
          'Pausadas',
          'Canceladas',
          'Horas Totales',
          'Horas Estimadas',
          'Promedio (h)',
          'Eficiencia (%)',
          'Promedio Completado (días)',
        ],
        ...report.mechanics.map((m) => [
          m.name,
          m.email,
          m.workshop?.name || 'Sin taller',
          m.totalOrders,
          m.completedOrders,
          m.inProgressOrders,
          m.pendingOrders,
          m.pausedOrders,
          m.cancelledOrders,
          m.totalHours.toFixed(2),
          m.estimatedHours.toFixed(2),
          m.averageHours.toFixed(2),
          m.efficiency.toFixed(1),
          m.averageCompletionDays.toFixed(1),
        ]),
      ]
      const mechanicsSheet = XLSX.utils.aoa_to_sheet(mechanicsData)
      XLSX.utils.book_append_sheet(workbook, mechanicsSheet, 'Mecánicos')
    }

    const date = new Date().toISOString().split('T')[0]
    const fileName = `Reporte_Desempeño_Mecánicos_${date}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  /**
   * Exporta el reporte de inventario a Excel
   */
  static exportInventoryReportToExcel(report: {
    summary: {
      totalParts: number
      totalValue: number
      lowStockCount: number
      outOfStockCount: number
    }
    byCategory: Array<{
      category: string
      count: number
      totalValue: number
      lowStockCount: number
    }>
    byWorkshop: Array<{
      workshopName: string
      count: number
      totalValue: number
      lowStockCount: number
    }>
    parts: Array<{
      code: string
      name: string
      category: string
      unitOfMeasure: string
      unitPrice: number
      currentStock: number
      minStock: number
      maxStock: number
      location: string | null
      totalValue: number
      isLowStock: boolean
      isOutOfStock: boolean
      usageCount: number
      workshop: { name: string } | null
    }>
  }): void {
    const workbook = XLSX.utils.book_new()

    // Hoja 1: Resumen
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Total Repuestos', report.summary.totalParts],
      ['Valor Total', `$${report.summary.totalValue.toLocaleString('es-CL')}`],
      ['Bajo Stock', report.summary.lowStockCount],
      ['Sin Stock', report.summary.outOfStockCount],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')

    // Hoja 2: Por Categoría
    if (report.byCategory.length > 0) {
      const categoryData = [
        ['Categoría', 'Cantidad', 'Valor Total', 'Bajo Stock'],
        ...report.byCategory.map((c) => [
          c.category,
          c.count,
          `$${c.totalValue.toLocaleString('es-CL')}`,
          c.lowStockCount,
        ]),
      ]
      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData)
      XLSX.utils.book_append_sheet(workbook, categorySheet, 'Por Categoría')
    }

    // Hoja 3: Por Taller
    if (report.byWorkshop.length > 0) {
      const workshopData = [
        ['Taller', 'Cantidad', 'Valor Total', 'Bajo Stock'],
        ...report.byWorkshop.map((w) => [
          w.workshopName,
          w.count,
          `$${w.totalValue.toLocaleString('es-CL')}`,
          w.lowStockCount,
        ]),
      ]
      const workshopSheet = XLSX.utils.aoa_to_sheet(workshopData)
      XLSX.utils.book_append_sheet(workbook, workshopSheet, 'Por Taller')
    }

    // Hoja 4: Repuestos
    if (report.parts.length > 0) {
      const partsData = [
        [
          'Código',
          'Nombre',
          'Categoría',
          'Unidad',
          'Precio Unitario',
          'Stock Actual',
          'Stock Mínimo',
          'Stock Máximo',
          'Valor Total',
          'Ubicación',
          'Estado',
          'Uso',
          'Taller',
        ],
        ...report.parts.map((p) => [
          p.code,
          p.name,
          p.category,
          p.unitOfMeasure,
          p.unitPrice,
          p.currentStock,
          p.minStock,
          p.maxStock,
          `$${p.totalValue.toLocaleString('es-CL')}`,
          p.location || '',
          p.isOutOfStock ? 'Sin Stock' : p.isLowStock ? 'Bajo Stock' : 'Normal',
          p.usageCount,
          p.workshop?.name || 'Sin taller',
        ]),
      ]
      const partsSheet = XLSX.utils.aoa_to_sheet(partsData)
      XLSX.utils.book_append_sheet(workbook, partsSheet, 'Repuestos')
    }

    const date = new Date().toISOString().split('T')[0]
    const fileName = `Reporte_Inventario_${date}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }

  /**
   * Exporta el reporte de costos a Excel
   */
  static exportCostsReportToExcel(report: {
    summary: {
      totalOrders: number
      totalLaborCost: number
      totalSparePartsCost: number
      totalCost: number
      totalHours: number
      averageCostPerOrder: number
      hourlyRate: number
      dateFrom: string | null
      dateTo: string | null
    }
    byWorkshop: Array<{
      workshopName: string
      orderCount: number
      totalLaborCost: number
      totalSparePartsCost: number
      totalCost: number
      totalHours: number
    }>
    byWorkType: Array<{
      workType: string
      orderCount: number
      totalLaborCost: number
      totalSparePartsCost: number
      totalCost: number
      totalHours: number
    }>
    byMechanic: Array<{
      mechanicName: string
      orderCount: number
      totalLaborCost: number
      totalSparePartsCost: number
      totalCost: number
      totalHours: number
    }>
    orders: Array<{
      orderNumber: string
      workType: string
      priority: string
      currentStatus: string
      totalHours: number
      laborCost: number
      sparePartsCost: number
      totalCost: number
      vehicle: { licensePlate: string } | null
      mechanic: { name: string } | null
      workshop: { name: string } | null
    }>
  }): void {
    const workbook = XLSX.utils.book_new()

    // Hoja 1: Resumen
    const summaryData = [
      ['Métrica', 'Valor'],
      ['Total Órdenes', report.summary.totalOrders],
      ['Costo Mano de Obra', `$${report.summary.totalLaborCost.toLocaleString('es-CL')}`],
      ['Costo Repuestos', `$${report.summary.totalSparePartsCost.toLocaleString('es-CL')}`],
      ['Costo Total', `$${report.summary.totalCost.toLocaleString('es-CL')}`],
      ['Total Horas', report.summary.totalHours.toFixed(2)],
      ['Promedio por Orden', `$${report.summary.averageCostPerOrder.toLocaleString('es-CL')}`],
      ['Tarifa por Hora', `$${report.summary.hourlyRate.toLocaleString('es-CL')}`],
      ['Fecha Desde', report.summary.dateFrom || 'N/A'],
      ['Fecha Hasta', report.summary.dateTo || 'N/A'],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')

    // Hoja 2: Por Taller
    if (report.byWorkshop.length > 0) {
      const workshopData = [
        ['Taller', 'Órdenes', 'Mano de Obra', 'Repuestos', 'Total', 'Horas'],
        ...report.byWorkshop.map((w) => [
          w.workshopName,
          w.orderCount,
          `$${w.totalLaborCost.toLocaleString('es-CL')}`,
          `$${w.totalSparePartsCost.toLocaleString('es-CL')}`,
          `$${w.totalCost.toLocaleString('es-CL')}`,
          w.totalHours.toFixed(2),
        ]),
      ]
      const workshopSheet = XLSX.utils.aoa_to_sheet(workshopData)
      XLSX.utils.book_append_sheet(workbook, workshopSheet, 'Por Taller')
    }

    // Hoja 3: Por Tipo de Trabajo
    if (report.byWorkType.length > 0) {
      const workTypeData = [
        ['Tipo de Trabajo', 'Órdenes', 'Mano de Obra', 'Repuestos', 'Total', 'Horas'],
        ...report.byWorkType.map((w) => [
          w.workType,
          w.orderCount,
          `$${w.totalLaborCost.toLocaleString('es-CL')}`,
          `$${w.totalSparePartsCost.toLocaleString('es-CL')}`,
          `$${w.totalCost.toLocaleString('es-CL')}`,
          w.totalHours.toFixed(2),
        ]),
      ]
      const workTypeSheet = XLSX.utils.aoa_to_sheet(workTypeData)
      XLSX.utils.book_append_sheet(workbook, workTypeSheet, 'Por Tipo')
    }

    // Hoja 4: Por Mecánico
    if (report.byMechanic.length > 0) {
      const mechanicData = [
        ['Mecánico', 'Órdenes', 'Mano de Obra', 'Repuestos', 'Total', 'Horas'],
        ...report.byMechanic.map((m) => [
          m.mechanicName,
          m.orderCount,
          `$${m.totalLaborCost.toLocaleString('es-CL')}`,
          `$${m.totalSparePartsCost.toLocaleString('es-CL')}`,
          `$${m.totalCost.toLocaleString('es-CL')}`,
          m.totalHours.toFixed(2),
        ]),
      ]
      const mechanicSheet = XLSX.utils.aoa_to_sheet(mechanicData)
      XLSX.utils.book_append_sheet(workbook, mechanicSheet, 'Por Mecánico')
    }

    // Hoja 5: Órdenes Detalladas
    if (report.orders.length > 0) {
      const ordersData = [
        [
          'Número Orden',
          'Tipo Trabajo',
          'Prioridad',
          'Estado',
          'Patente',
          'Mecánico',
          'Taller',
          'Horas',
          'Costo Mano Obra',
          'Costo Repuestos',
          'Costo Total',
        ],
        ...report.orders.map((o) => [
          o.orderNumber,
          o.workType,
          o.priority,
          o.currentStatus,
          o.vehicle?.licensePlate || 'N/A',
          o.mechanic?.name || 'Sin asignar',
          o.workshop?.name || 'N/A',
          o.totalHours.toFixed(2),
          `$${o.laborCost.toLocaleString('es-CL')}`,
          `$${o.sparePartsCost.toLocaleString('es-CL')}`,
          `$${o.totalCost.toLocaleString('es-CL')}`,
        ]),
      ]
      const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData)
      XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Órdenes')
    }

    const date = new Date().toISOString().split('T')[0]
    const fileName = `Reporte_Costos_${date}.xlsx`
    XLSX.writeFile(workbook, fileName)
  }
}

