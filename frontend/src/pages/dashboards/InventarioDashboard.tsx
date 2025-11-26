import { MainLayout } from '../../components/Layout/MainLayout'
import { CreateSparePartModal } from '../../components/modals/CreateSparePartModal'
import { useState } from 'react'
import { Package, AlertTriangle, CircleDot, DollarSign, Wrench, BarChart, Bell } from 'lucide-react'

export default function InventarioDashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h2>
            <p className="text-gray-600">Control de repuestos y stock</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            + Agregar Repuesto
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Items"
            value="156"
            change="+12"
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Stock Bajo"
            value="8"
            change="-2"
            icon={AlertTriangle}
            color="yellow"
          />
          <StatCard
            title="Sin Stock"
            value="2"
            change="+1"
            icon={CircleDot}
            color="red"
          />
          <StatCard
            title="Valor Total"
            value="$45M"
            change="+8%"
            icon={DollarSign}
            color="green"
          />
        </div>

        {/* Alertas Críticas */}
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">
                Alertas Críticas de Stock
              </h3>
              <p className="text-sm text-red-700">
                2 items sin stock, 8 items bajo mínimo
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <CriticalAlert
              item="Neumático 295/80R22.5"
              current={0}
              min={8}
              status="sin_stock"
            />
            <CriticalAlert
              item="Batería 12V 100Ah"
              current={1}
              min={5}
              status="crítico"
            />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Bajo */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Repuestos con Stock Bajo
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todos →
              </button>
            </div>
            <div className="space-y-3">
              <StockItem
                code="REP-001"
                name="Filtro de Aceite"
                current={3}
                min={10}
                location="Estante A1"
              />
              <StockItem
                code="REP-002"
                name="Pastillas de Freno"
                current={5}
                min={8}
                location="Estante B2"
              />
              <StockItem
                code="REP-003"
                name="Aceite Motor 15W40"
                current={45}
                min={50}
                location="Bodega C"
              />
              <StockItem
                code="REP-004"
                name="Batería 12V"
                current={2}
                min={5}
                location="Estante D1"
              />
            </div>
          </div>

          {/* Solicitudes Pendientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Solicitudes de Repuestos
            </h3>
            <div className="space-y-3">
              <SparePartRequest
                orderNumber="OT-2025-105"
                mechanic="Carlos Silva"
                items={[
                  { name: 'Filtro de aceite', qty: 1 },
                  { name: 'Aceite 15W40', qty: 6 },
                ]}
                status="pendiente"
              />
              <SparePartRequest
                orderNumber="OT-2025-106"
                mechanic="Ana Martínez"
                items={[{ name: 'Pastillas de freno', qty: 1 }]}
                status="pendiente"
              />
              <SparePartRequest
                orderNumber="OT-2025-104"
                mechanic="Pedro López"
                items={[{ name: 'Batería 12V', qty: 1 }]}
                status="entregado"
              />
            </div>
          </div>
        </div>

        {/* Movimientos Recientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Movimientos Recientes
          </h3>
          <div className="space-y-2">
            <Movement
              type="salida"
              item="Filtro de aceite"
              quantity={1}
              reason="Orden OT-2025-105"
              time="Hace 30 min"
            />
            <Movement
              type="entrada"
              item="Aceite Motor 15W40"
              quantity={50}
              reason="Compra mensual"
              time="Hace 2 horas"
            />
            <Movement
              type="salida"
              item="Pastillas de freno"
              quantity={2}
              reason="Orden OT-2025-103"
              time="Hace 4 horas"
            />
            <Movement
              type="ajuste"
              item="Batería 12V"
              quantity={-1}
              reason="Inventario físico"
              time="Ayer"
            />
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickAction icon="➕" label="Registrar Entrada" />
            <QuickAction icon="➖" label="Registrar Salida" />
            <QuickAction icon={Wrench} label="Nuevo Repuesto" />
            <QuickAction icon={BarChart} label="Generar Reporte" />
          </div>
        </div>
      </div>

      {/* Modal de creación de repuesto */}
      <CreateSparePartModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Recargar la página o actualizar datos
          window.location.reload()
        }}
      />
    </MainLayout>
  )
}

function StatCard({ title, value, change, icon: IconComponent, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{change}</p>
        </div>
        {IconComponent && (
          <div className={`${colors[color]} p-3 rounded-lg`}>
            <IconComponent className="w-8 h-8" />
          </div>
        )}
      </div>
    </div>
  )
}

function CriticalAlert({ item, current, min, status }: any) {
  const isOutOfStock = current === 0

  return (
    <div className={`p-4 rounded-lg ${isOutOfStock ? 'bg-red-100 border-2 border-red-300' : 'bg-orange-100 border-2 border-orange-300'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900">{item}</p>
          <p className="text-sm text-gray-700">
            Stock: {current}/{min} unidades
          </p>
        </div>
        <button className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
          Solicitar
        </button>
      </div>
    </div>
  )
}

function StockItem({ code, name, current, min, location }: any) {
  const percentage = (current / min) * 100
  const isLow = percentage < 50

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{code} - {location}</p>
        </div>
        <span className="text-sm font-bold text-gray-700">
          {current}/{min}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${isLow ? 'bg-red-500' : 'bg-orange-500'}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}

function SparePartRequest({ orderNumber, mechanic, items, status }: any) {
  const statusConfig: Record<string, any> = {
    pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    entregado: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  }

  const config = statusConfig[status]

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900">{orderNumber}</p>
          <p className="text-sm text-gray-600">Mecánico: {mechanic}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      </div>
      <ul className="text-sm text-gray-700 space-y-1">
        {items.map((item: any, i: number) => (
          <li key={i}>• {item.name} x{item.qty}</li>
        ))}
      </ul>
      {status === 'pendiente' && (
        <button className="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          Entregar
        </button>
      )}
    </div>
  )
}

function Movement({ type, item, quantity, reason, time }: any) {
  const typeConfig: Record<string, any> = {
    entrada: { icon: Package, color: 'text-green-600' },
    salida: { icon: Package, color: 'text-red-600' },
    ajuste: { icon: Wrench, color: 'text-blue-600' },
  }

  const config = typeConfig[type]
  const IconComponent = config.icon

  return (
    <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
      {IconComponent && <IconComponent className={`w-5 h-5 ${config.color}`} />}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {item} ({quantity > 0 ? '+' : ''}{quantity})
        </p>
        <p className="text-xs text-gray-600">{reason}</p>
      </div>
      <span className="text-xs text-gray-500">{time}</span>
    </div>
  )
}

function QuickAction({ icon: IconComponent, label }: any) {
  return (
    <button className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
      {IconComponent && <IconComponent className="w-8 h-8 mb-2 text-gray-600" />}
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  )
}