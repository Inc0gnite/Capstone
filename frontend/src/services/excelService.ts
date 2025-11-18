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
}

