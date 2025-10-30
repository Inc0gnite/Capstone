import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivateRoute } from './components/PrivateRoute'
import { RoleBasedRoute } from './components/RoleBasedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Entries from './pages/Entries'
import EntryDetail from './pages/EntryDetail'
import Vehicles from './pages/Vehicles'
import Users from './pages/Users'
import WorkOrders from './pages/WorkOrders'
import WorkOrderDetail from './pages/WorkOrderDetail'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import GuardiaDashboard from './pages/dashboards/GuardiaDashboard'
import RecepcionistaDashboard from './pages/dashboards/RecepcionistaDashboard'
import MecanicoDashboard from './pages/dashboards/MecanicoDashboard'
import JefeTallerDashboard from './pages/dashboards/JefeTallerDashboard'
import TeamPerformance from './pages/dashboards/TeamPerformance'
import InventarioDashboard from './pages/dashboards/InventarioDashboard'
import MechanicOrders from './pages/mechanic/MechanicOrders'
import MechanicSpareParts from './pages/mechanic/MechanicSpareParts'
import Diagnostic from './Diagnostic'
import Reports from './pages/Reports'
import ResetPassword from './pages/ResetPassword'
import Inventory from './pages/Inventory'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/diagnostic" element={<Diagnostic />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/entries"
            element={
              <PrivateRoute>
                <Entries />
              </PrivateRoute>
            }
          />
          <Route
            path="/entries/:id"
            element={
              <PrivateRoute>
                <EntryDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <RoleBasedRoute allowedRoles={['Administrador']}>
                <Users />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/vehicles"
            element={
              <PrivateRoute>
                <Vehicles />
              </PrivateRoute>
            }
          />
          <Route
            path="/work-orders"
            element={
              <PrivateRoute>
                <WorkOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/work-orders/:id"
            element={
              <PrivateRoute>
                <WorkOrderDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard/guardia"
            element={
              <RoleBasedRoute allowedRoles={['Guardia', 'Administrador']}>
                <GuardiaDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/dashboard/recepcionista"
            element={
              <RoleBasedRoute allowedRoles={['Recepcionista', 'Administrador']}>
                <RecepcionistaDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/dashboard/administrador"
            element={
              <RoleBasedRoute allowedRoles={['Administrador']}>
                <AdminDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/dashboard/mecanico"
            element={
              <RoleBasedRoute allowedRoles={['Mecánico', 'Administrador']}>
                <MecanicoDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/mechanic/orders"
            element={
              <RoleBasedRoute allowedRoles={['Mecánico', 'Administrador']}>
                <MechanicOrders />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/mechanic/spare-parts"
            element={
              <RoleBasedRoute allowedRoles={['Mecánico', 'Administrador']}>
                <MechanicSpareParts />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <RoleBasedRoute allowedRoles={['Administrador', 'Jefe de Taller', 'Encargado de Inventario']}>
                <Inventory />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <RoleBasedRoute allowedRoles={['Administrador', 'Jefe de Taller']}>
                <Reports />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/dashboard/jefe-taller"
            element={
              <RoleBasedRoute allowedRoles={['Jefe de Taller', 'Administrador']}>
                <JefeTallerDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/dashboard/jefe-taller/equipo"
            element={
              <RoleBasedRoute allowedRoles={['Jefe de Taller', 'Administrador']}>
                <TeamPerformance />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/dashboard/inventario"
            element={
              <RoleBasedRoute allowedRoles={['Inventario', 'Administrador']}>
                <InventarioDashboard />
              </RoleBasedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App




