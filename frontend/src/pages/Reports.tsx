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
import { reportService, type FleetReport } from '../services/reportService'
import { regionService } from '../services/regionService'
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

        const [k, perf, orders, parts, regionsData] = await Promise.all([
          kpisPromise,
          perfPromise,
          ordersPromise,
          lowStockPromise,
          regionsPromise,
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

        {/* Reporte de Flota */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Reporte de Flota</h3>
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
                <button
                  onClick={handleExportFleetReportPDF}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <span>📄</span>
                  <span>Exportar PDF</span>
                </button>
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

        {/* KPIs */}
        {kpis && (
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


