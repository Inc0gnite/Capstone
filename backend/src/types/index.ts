// Tipos compartidos para el backend

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  rut: string
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  roleId: string
  workshopId?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface VehicleFilters {
  page?: number
  limit?: number
  search?: string
  brand?: string
  model?: string
  year?: number
  regionId?: string
  status?: string
  vehicleType?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface WorkOrderFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  priority?: string
  workshopId?: string
  assignedToId?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SparePartFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  brand?: string
  lowStock?: boolean
  workshopId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DashboardStats {
  totalVehicles?: number
  activeEntries?: number
  completedOrders?: number
  pendingOrders?: number
  totalMechanics?: number
  availableMechanics?: number
  vehiclesInWorkshop?: number
  activeWorkOrders?: number
  completedToday?: number
  pendingWorkOrders?: number
  lowStockItems?: number
  recentEntries?: any
  urgentWorkOrders?: any
}
