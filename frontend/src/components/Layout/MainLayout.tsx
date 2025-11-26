import { ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { NotificationDropdown } from '../Notifications/NotificationDropdown'
import { 
  Home, Users, Car, FileText, Wrench, Factory, BarChart, 
  Package, LogOut, Clipboard
} from 'lucide-react'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Navegación según rol
  const getNavItems = () => {
    const roleName = (user as any)?.role?.name || ''

    // Elementos comunes solo para roles que no son Recepcionista ni Jefe de Taller
    const commonItems = (roleName !== 'Recepcionista' && roleName !== 'Jefe de Taller') ? [
      { name: 'Inicio', href: '/dashboard', icon: Home },
    ] : []

    const roleItems: Record<string, any[]> = {
      Administrador: [
        { name: 'Usuarios', href: '/users', icon: Users },
        { name: 'Vehículos', href: '/vehicles', icon: Car },
        { name: 'Ingresos', href: '/entries', icon: FileText },
        { name: 'Órdenes', href: '/work-orders', icon: Wrench },
        { name: 'Inventario', href: '/inventory', icon: Wrench },
        { name: 'Talleres', href: '/workshops', icon: Factory },
        { name: 'Reportes', href: '/reports', icon: BarChart },
      ],
      Guardia: [
        { name: 'Ingresos', href: '/entries', icon: FileText },
        { name: 'Vehículos', href: '/vehicles', icon: Car },
      ],
      Recepcionista: [
        { name: 'Dashboard', href: '/dashboard/recepcionista', icon: BarChart },
        { name: 'Órdenes', href: '/work-orders', icon: Wrench },
        { name: 'Vehículos', href: '/vehicles', icon: Car },
      ],
      Mecánico: [
        { name: 'Mis Órdenes', href: '/mechanic/orders', icon: Wrench },
        { name: 'Repuestos', href: '/mechanic/spare-parts', icon: Wrench },
        { name: 'Inventario', href: '/inventory', icon: Package },
      ],
      'Jefe de Taller': [
        { name: 'Inicio', href: '/dashboard/jefe-taller', icon: Home },
        { name: 'Órdenes', href: '/work-orders', icon: Wrench },
        { name: 'Inventario', href: '/inventory', icon: Wrench },
        { name: 'Vehículos', href: '/vehicles', icon: Car },
        { name: 'Reportes', href: '/reports', icon: BarChart },
      ],
      'Encargado de Inventario': [
        { name: 'Inventario', href: '/inventory', icon: Wrench },
        { name: 'Movimientos', href: '/movements', icon: Package },
        { name: 'Órdenes', href: '/work-orders', icon: Wrench },
      ],
    }

    return [...commonItems, ...(roleItems[roleName] || [])]
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y Botón Hamburger */}
            <div className="flex items-center space-x-3 flex-1">
              {/* Botón hamburger para móvil */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Abrir menú</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">PepsiCo Fleet</h1>
                <p className="text-xs text-gray-500">{(user as any)?.role?.name || 'Usuario'}</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-gray-900">PepsiCo</h1>
              </div>
            </div>

            {/* Taller - Centro */}
            {(user as any)?.workshop && (
              <div className="hidden md:flex items-center justify-center flex-1">
                <p className="text-sm font-medium text-blue-600">
                  {(user as any).workshop.name}
                </p>
              </div>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 justify-end">
              {/* Notificaciones - Disponible para todos los usuarios */}
              <NotificationDropdown />

              {/* Usuario - Responsive */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Información del usuario - oculta en móvil muy pequeño */}
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-32">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-32">{user?.email}</p>
                </div>
                
                {/* Versión compacta para móvil */}
                <div className="md:hidden">
                  <p className="text-sm font-medium text-gray-700 truncate max-w-24">
                    {user?.firstName}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition flex items-center gap-1"
                  aria-label="Cerrar sesión"
                >
                  <span className="hidden sm:inline">Salir</span>
                  <LogOut className="w-4 h-4 sm:hidden" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:top-16 lg:h-[calc(100vh-4rem)]
        `}>
          <nav className="p-3 sm:p-4 space-y-1 h-full overflow-y-auto">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition text-sm sm:text-base"
                  onClick={() => setSidebarOpen(false)} // Cerrar sidebar al hacer clic en móvil
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </a>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)] w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}


