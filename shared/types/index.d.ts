export interface User {
    id: string;
    rut: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    roleId: string;
    workshopId?: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Role {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}
export interface Permission {
    id: string;
    resource: string;
    action: string;
    description?: string;
    createdAt: string;
}
export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
export interface RegisterRequest {
    rut: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    roleId: string;
    workshopId?: string;
}
export interface Vehicle {
    id: string;
    licensePlate: string;
    vehicleType: string;
    brand: string;
    model: string;
    year: number;
    vin?: string;
    fleetNumber?: string;
    regionId: string;
    status: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface VehicleEntry {
    id: string;
    entryCode: string;
    vehicleId: string;
    workshopId: string;
    driverRut: string;
    driverName: string;
    driverPhone?: string;
    entryDate: string;
    exitDate?: string;
    entryKm: number;
    exitKm?: number;
    fuelLevel: string;
    hasKeys: boolean;
    observations?: string;
    photos?: string[];
    status: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}
export interface KeyControl {
    id: string;
    entryId: string;
    keyLocation: string;
    deliveredTo?: string;
    deliveredAt?: string;
    returnedBy?: string;
    returnedAt?: string;
    observations?: string;
    createdAt: string;
    updatedAt: string;
}
export interface WorkOrder {
    id: string;
    orderNumber: string;
    vehicleId: string;
    entryId: string;
    workshopId: string;
    workType: string;
    priority: 'baja' | 'media' | 'alta' | 'critica';
    description: string;
    estimatedHours?: number;
    assignedToId?: string;
    currentStatus: string;
    startedAt?: string;
    completedAt?: string;
    totalHours?: number;
    observations?: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}
export interface WorkOrderStatusHistory {
    id: string;
    workOrderId: string;
    status: string;
    observations?: string;
    changedById: string;
    changedAt: string;
}
export interface WorkOrderPhoto {
    id: string;
    workOrderId: string;
    url: string;
    description?: string;
    photoType: string;
    uploadedAt: string;
}
export interface WorkPause {
    id: string;
    workOrderId: string;
    reason: string;
    pausedAt: string;
    resumedAt?: string;
    duration?: number;
    observations?: string;
}
export interface SparePart {
    id: string;
    code: string;
    name: string;
    description?: string;
    category: string;
    unitOfMeasure: string;
    unitPrice: number;
    currentStock: number;
    minStock: number;
    maxStock: number;
    location?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface WorkOrderSparePart {
    id: string;
    workOrderId: string;
    sparePartId: string;
    quantityRequested: number;
    quantityDelivered?: number;
    status: string;
    requestedAt: string;
    deliveredAt?: string;
    observations?: string;
}
export interface SparePartMovement {
    id: string;
    sparePartId: string;
    movementType: string;
    quantity: number;
    previousStock: number;
    newStock: number;
    reason: string;
    reference?: string;
    createdAt: string;
}
export interface Region {
    id: string;
    code: string;
    name: string;
    isActive: boolean;
    createdAt: string;
}
export interface Workshop {
    id: string;
    code: string;
    name: string;
    regionId: string;
    address: string;
    city: string;
    phone?: string;
    capacity?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface WorkshopSchedule {
    id: string;
    workshopId: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isActive: boolean;
}
export interface Document {
    id: string;
    name: string;
    type: string;
    url: string;
    relatedTo: string;
    relatedId: string;
    uploadedAt: string;
}
export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: string;
    relatedTo?: string;
    relatedId?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
}
export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface VehicleFilters extends PaginationParams {
    search?: string;
    vehicleType?: string;
    regionId?: string;
    status?: string;
}
export interface WorkOrderFilters extends PaginationParams {
    search?: string;
    status?: string;
    priority?: string;
    workshopId?: string;
    assignedToId?: string;
    dateFrom?: string;
    dateTo?: string;
}
export interface SparePartFilters extends PaginationParams {
    search?: string;
    category?: string;
    lowStock?: boolean;
}
export interface DashboardStats {
    totalVehicles: number;
    vehiclesInWorkshop: number;
    activeWorkOrders: number;
    completedToday: number;
    pendingWorkOrders: number;
    lowStockItems: number;
    recentEntries: VehicleEntry[];
    urgentWorkOrders: WorkOrder[];
}
export declare enum UserRole {
    ADMIN = "Administrador",
    GUARD = "Guardia",
    RECEPTIONIST = "Recepcionista",
    MECHANIC = "Mec\u00E1nico",
    WORKSHOP_MANAGER = "Jefe de Taller",
    INVENTORY_MANAGER = "Encargado de Inventario"
}
export declare enum VehicleStatus {
    ACTIVE = "active",
    IN_MAINTENANCE = "in_maintenance",
    INACTIVE = "inactive"
}
export declare enum WorkOrderStatus {
    PENDING = "pendiente",
    IN_PROGRESS = "en_progreso",
    PAUSED = "pausado",
    COMPLETED = "completado",
    CANCELLED = "cancelado"
}
export declare enum WorkOrderPriority {
    LOW = "baja",
    MEDIUM = "media",
    HIGH = "alta",
    CRITICAL = "critica"
}
//# sourceMappingURL=index.d.ts.map