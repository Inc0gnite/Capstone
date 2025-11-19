import { useEffect, useMemo, useState } from 'react'
import { MainLayout } from '../components/Layout/MainLayout'
import { useAuthStore } from '../store/authStore'
import { dashboardService } from '../services/dashboardService'
import { workOrderService, type WorkOrder } from '../services/workOrderService'
import { sparePartService } from '../services/sparePartService'
import { vehicleService } from '../services/vehicleService'
import { vehicleEntryService } from '../services/vehicleEntryService'
import { userService } from '../services/userService'
import { ExcelService } from '../services/excelService'
import { 
  reportService, 
  type FleetReport,
  type MechanicsPerformanceReport,
  type InventoryReport,
  type CostsReport
} from '../services/reportService'
import { regionService } from '../services/regionService'
import { workshopService } from '../services/workshopService'
import { PDFService } from '../services/pdfService'

type KPIs = {
  total: number
  pendientes: number
  en_progreso: number
  pausados: number
  completados: number
  cancelados: number
  completadosHoy: number
}

export default function Reports() {
  const { user } = useAuthStore()
  const workshopId = (user as any)?.workshopId
  const roleName = (user as any)?.role?.name

  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [mechanicsPerformance, setMechanicsPerformance] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<WorkOrder[]>([])
  const [lowStockParts, setLowStockParts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para Reporte de Flota
  const [showFleetReport, setShowFleetReport] = useState(false)
  const [fleetReport, setFleetReport] = useState<FleetReport | null>(null)
  const [loadingFleetReport, setLoadingFleetReport] = useState(false)
  const [regions, setRegions] = useState<any[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Estados para Reporte de Desempeño de Mecánicos
  const [showMechanicsReport, setShowMechanicsReport] = useState(false)
  const [mechanicsReport, setMechanicsReport] = useState<MechanicsPerformanceReport | null>(null)
  const [loadingMechanicsReport, setLoadingMechanicsReport] = useState(false)
  const [mechanicsDateFrom, setMechanicsDateFrom] = useState('')
  const [mechanicsDateTo, setMechanicsDateTo] = useState('')
  const [mechanicsWorkshopId, setMechanicsWorkshopId] = useState<string>('')

  // Estados para Reporte de Inventario
  const [showInventoryReport, setShowInventoryReport] = useState(false)
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null)
  const [loadingInventoryReport, setLoadingInventoryReport] = useState(false)
  const [inventoryCategory, setInventoryCategory] = useState<string>('')
  const [inventoryLowStock, setInventoryLowStock] = useState(false)
  const [inventorySearch, setInventorySearch] = useState('')
  const [inventoryWorkshopId, setInventoryWorkshopId] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])

  // Estados para Reporte de Costos
  const [showCostsReport, setShowCostsReport] = useState(false)
  const [costsReport, setCostsReport] = useState<CostsReport | null>(null)
  const [loadingCostsReport, setLoadingCostsReport] = useState(false)
  const [costsDateFrom, setCostsDateFrom] = useState('')
  const [costsDateTo, setCostsDateTo] = useState('')
  const [costsWorkshopId, setCostsWorkshopId] = useState<string>('')
  const [workshops, setWorkshops] = useState<any[]>([])

  // Estado para el tipo de reporte seleccionado
  const [selectedReportType, setSelectedReportType] = useState<string>('')

  const canSeeAllWorkshops = useMemo(() => roleName === 'Administrador', [roleName])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const kpisPromise = dashboardService.getGeneralStats(canSeeAllWorkshops ? undefined : workshopId)
        const perfPromise = dashboardService.getMechanicsPerformance(canSeeAllWorkshops ? undefined : workshopId)
        const ordersPromise = workOrderService.getAll({
          workshopId: canSeeAllWorkshops ? undefined : workshopId,
          limit: 10,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        const lowStockPromise = sparePartService.getAll({
          page: 1,
          limit: 10,
          lowStock: true,
          workshopId: canSeeAllWorkshops ? undefined : workshopId,
        })
        const regionsPromise = regionService.getAll()
        const workshopsPromise = canSeeAllWorkshops ? workshopService.getAll() : Promise.resolve({ data: [] })

        const [k, perf, orders, parts, regionsData, workshopsData] = await Promise.all([
          kpisPromise,
          perfPromise,
          ordersPromise,
          lowStockPromise,
          regionsPromise,
          workshopsPromise,
        ])

        // Mapear kpis de backend → frontend
        const mappedKpis: KPIs = {
          total: k.total || 0,
          pendientes: k.pending || 0,
          en_progreso: k.inProgress || 0,
          pausados: k.paused || 0,
          completados: k.completed || 0,
          cancelados: k.cancelled || 0,
          completadosHoy: k.completedToday || 0,
        }

        setKpis(mappedKpis)
        setMechanicsPerformance(perf || [])
        setRecentOrders(orders.data || [])
        setLowStockParts(parts.data || [])
        setRegions(regionsData.data || [])
        setWorkshops(workshopsData.data || [])

        // Obtener categorías únicas de repuestos
        const allParts = parts.data || []
        const uniqueCategories = Array.from(new Set(allParts.map((p: any) => p.category).filter(Boolean)))
        setCategories(uniqueCategories as string[])
      } catch (err: any) {
        console.error('❌ Error cargando reportes:', err)
        setError(err?.response?.data?.message || 'Error cargando reportes')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [workshopId, canSeeAllWorkshops])

  const handleGenerateFleetReport = async () => {
    try {
      setLoadingFleetReport(true)
      setError(null)

      const params: any = {}
      if (selectedRegionId) params.regionId = selectedRegionId
      if (dateFrom) params.dateFrom = dateFrom
      if (dateTo) params.dateTo = dateTo

      const report = await reportService.generateFleetReport(params)
      setFleetReport(report)
      setShowFleetReport(true)
    } catch (err: any) {
      console.error('Error generando reporte de flota:', err)
      setError(err?.response?.data?.error || 'Error al generar el reporte de flota')
    } finally {
      setLoadingFleetReport(false)
    }
  }

  const handleExportFleetReportPDF = () => {
    if (!fleetReport) return
    
    // Convertir el reporte a formato de órdenes para el PDF
    const allWorkOrders: WorkOrder[] = fleetReport.vehicles.flatMap((v) =>
      v.entries.flatMap((e) =>
        e.workOrders.map((wo) => ({
          id: wo.id,
          orderNumber: wo.orderNumber,
          workType: wo.workType,
          priority: wo.priority,
          currentStatus: wo.currentStatus,
          description: '',
          vehicle: {
            id: v.id,
            licensePlate: v.licensePlate,
          } as any,
        } as WorkOrder))
      )
    )

    PDFService.generateMultipleOrdersPDF(
      allWorkOrders,
      `Reporte de Flota${selectedRegionId ? ` - ${regions.find(r => r.id === selectedRegionId)?.name || ''}` : ''}${dateFrom && dateTo ? ` (${dateFrom} a ${dateTo})` : ''}`
    )
  }

  const handleGenerateMechanicsReport = async () => {
    try {
      setLoadingMechanicsReport(true)
      setError(null)

      const params: any = {}
      if (mechanicsWorkshopId) params.workshopId = mechanicsWorkshopId
      if (mechanicsDateFrom) params.dateFrom = mechanicsDateFrom
      if (mechanicsDateTo) params.dateTo = mechanicsDateTo

      const report = await reportService.generateMechanicsPerformanceReport(params)
      setMechanicsReport(report)
      setShowMechanicsReport(true)
    } catch (err: any) {
      console.error('Error generando reporte de desempeño:', err)
      setError(err?.response?.data?.error || 'Error al generar el reporte de desempeño de mecánicos')
    } finally {
      setLoadingMechanicsReport(false)
    }
  }

  const handleGenerateInventoryReport = async () => {
    try {
      setLoadingInventoryReport(true)
      setError(null)

      const params: any = {}
      if (inventoryWorkshopId) params.workshopId = inventoryWorkshopId
      if (inventoryCategory) params.category = inventoryCategory
      if (inventoryLowStock) params.lowStock = true
      if (inventorySearch) params.search = inventorySearch

      const report = await reportService.generateInventoryReport(params)
      setInventoryReport(report)
      setShowInventoryReport(true)
    } catch (err: any) {
      console.error('Error generando reporte de inventario:', err)
      setError(err?.response?.data?.error || 'Error al generar el reporte de inventario')
    } finally {
      setLoadingInventoryReport(false)
    }
  }

  const handleGenerateCostsReport = async () => {
    try {
      setLoadingCostsReport(true)
      setError(null)

      const params: any = {}
      if (costsWorkshopId) params.workshopId = costsWorkshopId
      if (costsDateFrom) params.dateFrom = costsDateFrom
      if (costsDateTo) params.dateTo = costsDateTo

      const report = await reportService.generateCostsReport(params)
      setCostsReport(report)
      setShowCostsReport(true)
    } catch (err: any) {
      console.error('Error generando reporte de costos:', err)
      setError(err?.response?.data?.error || 'Error al generar el reporte de costos')
    } finally {
      setLoadingCostsReport(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando reportes...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const hasAnyData = !!kpis || mechanicsPerformance.length > 0 || recentOrders.length > 0 || lowStockParts.length > 0

  // Estado de error o ausencia total de datos
  if (error || !hasAnyData) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
              <p className="text-gray-600">Indicadores y rendimiento del taller</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-3">🛈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No hay reportes</h3>
            <p className="text-gray-600">{error ? 'No fue posible cargar los reportes en este momento.' : 'Aún no hay datos para mostrar.'}</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Limpiar reportes cuando se cambia el tipo
  const handleReportTypeChange = (reportType: string) => {
    setSelectedReportType(reportType)
    // Limpiar todos los reportes
    setShowFleetReport(false)
    setFleetReport(null)
    setShowMechanicsReport(false)
    setMechanicsReport(null)
    setShowInventoryReport(false)
    setInventoryReport(null)
    setShowCostsReport(false)
    setCostsReport(null)
  }

  const reportTypes = [
    { value: 'fleet', label: 'Reporte de Flota', icon: '🚛' },
    { value: 'mechanics', label: 'Reporte de Desempeño de Mecánicos', icon: '👷' },
    { value: 'inventory', label: 'Reporte de Inventario', icon: '📦' },
    { value: 'costs', label: 'Reporte de Costos', icon: '💰' },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
            <p className="text-gray-600">Indicadores y rendimiento del taller</p>
          </div>
          <button
            onClick={async () => {
              try {
                // Función helper para cargar todos los datos paginados
                const loadAllPaginated = async <T,>(
                  loadFn: (params: any) => Promise<any>,
                  params: any,
                  dataKey: string = 'data'
                ): Promise<T[]> => {
                  const allData: T[] = []
                  let page = 1
                  let hasMore = true
                  
                  while (hasMore) {
                    try {
                      const response = await loadFn({ ...params, page, limit: 100 })
                      const responseData = response.data || response
                      const pageData = responseData[dataKey as keyof typeof responseData] as T[]
                      
                      if (pageData && Array.isArray(pageData) && pageData.length > 0) {
                        allData.push(...pageData)
                        const totalPages = responseData.totalPages || Math.ceil((responseData.total || 0) / 100)
                        hasMore = page < totalPages
                        page++
                      } else {
                        hasMore = false
                      }
                    } catch (error) {
                      console.error(`Error cargando página ${page}:`, error)
                      hasMore = false
                    }
                  }
                  
                  return allData
                }

                // Cargar todos los datos con paginación
                const [allOrdersData, allPartsData, allVehiclesData, allEntriesData, allUsersData] = await Promise.allSettled([
                  loadAllPaginated(
                    (params) => workOrderService.getAll({ ...params, workshopId: canSeeAllWorkshops ? undefined : workshopId }),
                    {},
                    'workOrders'
                  ),
                  loadAllPaginated(
                    (params) => sparePartService.getAll({ ...params, workshopId: canSeeAllWorkshops ? undefined : workshopId }),
                    {},
                    'data'
                  ),
                  loadAllPaginated(
                    (params) => vehicleService.getAll(params),
                    {},
                    'vehicles'
                  ),
                  loadAllPaginated(
                    (params) => vehicleEntryService.getAll({ ...params, workshopId: canSeeAllWorkshops ? undefined : workshopId }),
                    {},
                    'entries'
                  ),
                  // Solo intentar cargar usuarios si es Administrador
                  canSeeAllWorkshops 
                    ? loadAllPaginated(
                        (params) => userService.getAll(params),
                        {},
                        'data'
                      )
                    : Promise.resolve([]),
                ])

                // Extraer datos de las promesas resueltas
                const orders = allOrdersData.status === 'fulfilled' ? allOrdersData.value : []
                const parts = allPartsData.status === 'fulfilled' ? allPartsData.value : []
                const vehicles = allVehiclesData.status === 'fulfilled' ? allVehiclesData.value : []
                const entries = allEntriesData.status === 'fulfilled' ? allEntriesData.value : []
                const users = allUsersData.status === 'fulfilled' ? allUsersData.value : []

                // Filtrar solo mecánicos de los usuarios
                const mechanics = users.filter((u: any) => u.role?.name === 'Mecánico')

                ExcelService.exportReportsToExcel({
                  kpis,
                  mechanicsPerformance,
                  allOrders: orders as any,
                  allParts: parts as any,
                  allVehicles: vehicles as any,
                  allEntries: entries as any,
                  allUsers: users as any,
                  allMechanics: mechanics as any,
                })
              } catch (err: any) {
                console.error('Error cargando datos para exportar:', err)
                alert('Error al cargar los datos para exportar. Por favor, intenta nuevamente.')
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2"
          >
            <span>📊</span>
            <span>Exportar Excel</span>
          </button>
        </div>

        {/* Selector de Tipo de Reporte */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Tipo de Reporte
            </label>
            <select
              value={selectedReportType}
              onChange={(e) => handleReportTypeChange(e.target.value)}
              className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
              <option value="">-- Seleccione un tipo de reporte --</option>
              {reportTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reporte de Flota */}
        {selectedReportType === 'fleet' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🚛 Reporte de Flota</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Región
              </label>
              <select
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Todas las regiones</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name} ({region.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateFleetReport}
                disabled={loadingFleetReport}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingFleetReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <span>📊</span>
                    <span>Generar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resultados del Reporte de Flota */}
          {showFleetReport && fleetReport && (
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">Resultados del Reporte</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (fleetReport) {
                        ExcelService.exportFleetReportToExcel(
                          fleetReport,
                          selectedRegionId ? regions.find(r => r.id === selectedRegionId)?.name : undefined
                        )
                      }
                    }}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <span>📊</span>
                    <span>Exportar Excel</span>
                  </button>
                  <button
                    onClick={handleExportFleetReportPDF}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <span>📄</span>
                    <span>Exportar PDF</span>
                  </button>
                </div>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Total Vehículos</div>
                  <div className="text-2xl font-bold text-blue-900">{fleetReport.summary.totalVehicles}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">Total Ingresos</div>
                  <div className="text-2xl font-bold text-green-900">{fleetReport.summary.totalEntries}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600 font-medium">Total Órdenes</div>
                  <div className="text-2xl font-bold text-purple-900">{fleetReport.summary.totalWorkOrders}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-orange-600 font-medium">Tiempo Promedio (h)</div>
                  <div className="text-2xl font-bold text-orange-900">{fleetReport.summary.averageCompletionTime.toFixed(2)}</div>
                </div>
              </div>

              {/* Por Región */}
              {fleetReport.byRegion.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Por Región</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Región</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Vehículos</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Órdenes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fleetReport.byRegion.map((region, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{region.regionName}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{region.vehicleCount}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{region.entryCount}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{region.workOrderCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Por Tipo de Vehículo */}
              {fleetReport.byVehicleType.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Por Tipo de Vehículo</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {fleetReport.byVehicleType.map((type, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">{type.vehicleType}</div>
                        <div className="text-xl font-bold text-gray-900">{type.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tabla de Vehículos (limitada a primeros 20) */}
              {fleetReport.vehicles.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    Vehículos ({fleetReport.vehicles.length} total)
                  </h5>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patente</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marca/Modelo</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Región</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Órdenes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {fleetReport.vehicles.slice(0, 20).map((vehicle) => (
                          <tr key={vehicle.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{vehicle.licensePlate}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{vehicle.vehicleType}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{vehicle.brand} {vehicle.model}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{vehicle.region?.name || '—'}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{vehicle.totalEntries}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{vehicle.totalWorkOrders}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {fleetReport.vehicles.length > 20 && (
                      <div className="text-center py-2 text-sm text-gray-500">
                        Mostrando 20 de {fleetReport.vehicles.length} vehículos
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Reporte de Desempeño de Mecánicos */}
        {selectedReportType === 'mechanics' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">👷 Reporte de Desempeño de Mecánicos</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {canSeeAllWorkshops && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taller
                </label>
                <select
                  value={mechanicsWorkshopId}
                  onChange={(e) => setMechanicsWorkshopId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Todos los talleres</option>
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={mechanicsDateFrom}
                onChange={(e) => setMechanicsDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={mechanicsDateTo}
                onChange={(e) => setMechanicsDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateMechanicsReport}
                disabled={loadingMechanicsReport}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingMechanicsReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <span>📊</span>
                    <span>Generar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showMechanicsReport && mechanicsReport && (
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">Resultados del Reporte</h4>
                <button
                  onClick={() => {
                    if (mechanicsReport) {
                      ExcelService.exportMechanicsPerformanceReportToExcel(mechanicsReport)
                    }
                  }}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Exportar Excel</span>
                </button>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Total Mecánicos</div>
                  <div className="text-2xl font-bold text-blue-900">{mechanicsReport.summary.totalMechanics}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">Total Órdenes</div>
                  <div className="text-2xl font-bold text-green-900">{mechanicsReport.summary.totalOrders}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600 font-medium">Completadas</div>
                  <div className="text-2xl font-bold text-purple-900">{mechanicsReport.summary.totalCompleted}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-orange-600 font-medium">Total Horas</div>
                  <div className="text-2xl font-bold text-orange-900">{mechanicsReport.summary.totalHours.toFixed(2)}</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-sm text-indigo-600 font-medium">Eficiencia Promedio</div>
                  <div className="text-2xl font-bold text-indigo-900">{mechanicsReport.summary.averageEfficiency.toFixed(1)}%</div>
                </div>
              </div>

              {/* Tabla de Mecánicos */}
              {mechanicsReport.mechanics.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mecánico</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Órdenes</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Completadas</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">En Progreso</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Horas Totales</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Eficiencia</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Promedio (días)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mechanicsReport.mechanics.map((mechanic) => (
                        <tr key={mechanic.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{mechanic.name}</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-700">{mechanic.totalOrders}</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-700">{mechanic.completedOrders}</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-700">{mechanic.inProgressOrders}</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-700">{mechanic.totalHours.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-700">{mechanic.efficiency.toFixed(1)}%</td>
                          <td className="px-4 py-2 text-sm text-right text-gray-700">{mechanic.averageCompletionDays.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Reporte de Inventario */}
        {selectedReportType === 'inventory' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📦 Reporte de Inventario</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {canSeeAllWorkshops && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taller
                </label>
                <select
                  value={inventoryWorkshopId}
                  onChange={(e) => setInventoryWorkshopId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Todos los talleres</option>
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={inventoryCategory}
                onChange={(e) => setInventoryCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Búsqueda
              </label>
              <input
                type="text"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                placeholder="Código o nombre..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inventoryLowStock}
                  onChange={(e) => setInventoryLowStock(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Solo bajo stock</span>
              </label>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateInventoryReport}
                disabled={loadingInventoryReport}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingInventoryReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <span>📊</span>
                    <span>Generar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showInventoryReport && inventoryReport && (
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">Resultados del Reporte</h4>
                <button
                  onClick={() => {
                    if (inventoryReport) {
                      ExcelService.exportInventoryReportToExcel(inventoryReport)
                    }
                  }}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Exportar Excel</span>
                </button>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Total Repuestos</div>
                  <div className="text-2xl font-bold text-blue-900">{inventoryReport.summary.totalParts}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">Valor Total</div>
                  <div className="text-2xl font-bold text-green-900">${inventoryReport.summary.totalValue.toLocaleString('es-CL')}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-yellow-600 font-medium">Bajo Stock</div>
                  <div className="text-2xl font-bold text-yellow-900">{inventoryReport.summary.lowStockCount}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600 font-medium">Sin Stock</div>
                  <div className="text-2xl font-bold text-red-900">{inventoryReport.summary.outOfStockCount}</div>
                </div>
              </div>

              {/* Por Categoría */}
              {inventoryReport.byCategory.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Por Categoría</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Bajo Stock</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventoryReport.byCategory.map((cat, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{cat.category}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{cat.count}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">${cat.totalValue.toLocaleString('es-CL')}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{cat.lowStockCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tabla de Repuestos (limitada a primeros 20) */}
              {inventoryReport.parts.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">
                    Repuestos ({inventoryReport.parts.length} total)
                  </h5>
                  <div className="overflow-x-auto max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventoryReport.parts.slice(0, 20).map((part) => (
                          <tr key={part.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">{part.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{part.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-700">{part.category}</td>
                            <td className={`px-4 py-2 text-sm text-right font-medium ${
                              part.isOutOfStock ? 'text-red-600' : part.isLowStock ? 'text-yellow-600' : 'text-gray-700'
                            }`}>
                              {part.currentStock} / {part.minStock}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">${part.unitPrice.toLocaleString('es-CL')}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">${part.totalValue.toLocaleString('es-CL')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {inventoryReport.parts.length > 20 && (
                      <div className="text-center py-2 text-sm text-gray-500">
                        Mostrando 20 de {inventoryReport.parts.length} repuestos
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Reporte de Costos */}
        {selectedReportType === 'costs' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">💰 Reporte de Costos</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {canSeeAllWorkshops && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taller
                </label>
                <select
                  value={costsWorkshopId}
                  onChange={(e) => setCostsWorkshopId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Todos los talleres</option>
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={costsDateFrom}
                onChange={(e) => setCostsDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={costsDateTo}
                onChange={(e) => setCostsDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerateCostsReport}
                disabled={loadingCostsReport}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingCostsReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </>
                ) : (
                  <>
                    <span>📊</span>
                    <span>Generar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {showCostsReport && costsReport && (
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-gray-900">Resultados del Reporte</h4>
                <button
                  onClick={() => {
                    if (costsReport) {
                      ExcelService.exportCostsReportToExcel(costsReport)
                    }
                  }}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <span>📊</span>
                  <span>Exportar Excel</span>
                </button>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 font-medium">Total Órdenes</div>
                  <div className="text-2xl font-bold text-blue-900">{costsReport.summary.totalOrders}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 font-medium">Costo Mano de Obra</div>
                  <div className="text-2xl font-bold text-green-900">${costsReport.summary.totalLaborCost.toLocaleString('es-CL')}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600 font-medium">Costo Repuestos</div>
                  <div className="text-2xl font-bold text-purple-900">${costsReport.summary.totalSparePartsCost.toLocaleString('es-CL')}</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-orange-600 font-medium">Costo Total</div>
                  <div className="text-2xl font-bold text-orange-900">${costsReport.summary.totalCost.toLocaleString('es-CL')}</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-sm text-indigo-600 font-medium">Promedio por Orden</div>
                  <div className="text-2xl font-bold text-indigo-900">${costsReport.summary.averageCostPerOrder.toLocaleString('es-CL')}</div>
                </div>
              </div>

              {/* Por Taller */}
              {costsReport.byWorkshop.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Por Taller</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Taller</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Órdenes</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Mano de Obra</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Repuestos</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {costsReport.byWorkshop.map((w, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{w.workshopName}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{w.orderCount}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">${w.totalLaborCost.toLocaleString('es-CL')}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">${w.totalSparePartsCost.toLocaleString('es-CL')}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">${w.totalCost.toLocaleString('es-CL')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Por Tipo de Trabajo */}
              {costsReport.byWorkType.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Por Tipo de Trabajo</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Órdenes</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Mano de Obra</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Repuestos</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {costsReport.byWorkType.map((w, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900 capitalize">{w.workType}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{w.orderCount}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">${w.totalLaborCost.toLocaleString('es-CL')}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">${w.totalSparePartsCost.toLocaleString('es-CL')}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">${w.totalCost.toLocaleString('es-CL')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Por Mecánico */}
              {costsReport.byMechanic.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">Por Mecánico</h5>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mecánico</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Órdenes</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Mano de Obra</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Repuestos</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {costsReport.byMechanic.map((m, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-sm text-gray-900">{m.mechanicName}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">{m.orderCount}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">${m.totalLaborCost.toLocaleString('es-CL')}</td>
                            <td className="px-4 py-2 text-sm text-right text-gray-700">${m.totalSparePartsCost.toLocaleString('es-CL')}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium text-gray-900">${m.totalCost.toLocaleString('es-CL')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* Mensaje cuando no hay reporte seleccionado */}
        {!selectedReportType && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Selecciona un tipo de reporte</h3>
            <p className="text-gray-600">
              Elige un tipo de reporte del menú desplegable para comenzar a generar reportes
            </p>
          </div>
        )}

        {/* KPIs - Mostrar solo si hay datos y no hay reporte seleccionado */}
        {!selectedReportType && kpis && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard title="Total" value={kpis.total} color="gray" icon="📋" />
            <KpiCard title="Pendientes" value={kpis.pendientes} color="yellow" icon="⏳" />
            <KpiCard title="En Progreso" value={kpis.en_progreso} color="blue" icon="🔨" />
            <KpiCard title="Pausadas" value={kpis.pausados} color="orange" icon="⏸️" />
            <KpiCard title="Completadas" value={kpis.completados} color="green" icon="✅" />
            <KpiCard title="Hoy" value={kpis.completadosHoy} color="emerald" icon="📅" />
          </div>
        )}

        {/* Rendimiento de Mecánicos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Rendimiento de Mecánicos</h3>
          </div>
          {mechanicsPerformance.length > 0 ? (
            <div className="md:overflow-visible overflow-x-auto">
              <table className="min-w-full table-fixed text-left text-sm">
                <thead>
                  <tr className="text-gray-600">
                    <th className="py-2 pr-4">Mecánico</th>
                    <th className="py-2 pr-4">Órdenes</th>
                    <th className="py-2 pr-4">En Progreso</th>
                    <th className="py-2 pr-4">Completadas</th>
                    <th className="py-2 pr-4">Horas Totales</th>
                    <th className="py-2 pr-4">Promedio (h)</th>
                  </tr>
                </thead>
                <tbody>
                  {mechanicsPerformance.map((m: any) => (
                    <tr key={m.id} className="border-t">
                      <td className="py-2 pr-4 break-words">{m.name}</td>
                      <td className="py-2 pr-4">{m.totalOrders}</td>
                      <td className="py-2 pr-4">{m.inProgressOrders}</td>
                      <td className="py-2 pr-4">{m.completedOrders}</td>
                      <td className="py-2 pr-4">{m.totalHours}</td>
                      <td className="py-2 pr-4">{m.averageHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">Sin datos de rendimiento.</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Órdenes recientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Órdenes recientes</h3>
            </div>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">{o.orderNumber}</div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">{o.currentStatus}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {o.vehicle?.licensePlate || 'N/A'} · {o.workType} · {o.priority}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No hay órdenes.</p>
            )}
          </div>

          {/* Repuestos con bajo stock */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Repuestos con bajo stock</h3>
            </div>
            {lowStockParts.length > 0 ? (
              <div className="space-y-3">
                {lowStockParts.map((p: any) => (
                  <div key={p.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <span className="text-sm text-red-600 font-medium">{p.currentStock} / {p.minStock}</span>
                    </div>
                    <div className="text-sm text-gray-600">{p.code} · {p.category || 'Sin categoría'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Sin alertas de stock.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

function KpiCard({ title, value, color, icon }: { title: string; value: number; color: string; icon: string }) {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-900',
    yellow: 'bg-yellow-100 text-yellow-900',
    blue: 'bg-blue-100 text-blue-900',
    orange: 'bg-orange-100 text-orange-900',
    green: 'bg-green-100 text-green-900',
    emerald: 'bg-emerald-100 text-emerald-900',
  }
  return (
    <div className={`rounded-lg p-4 ${colorMap[color] || colorMap.gray}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium opacity-80">{title}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  )
}


