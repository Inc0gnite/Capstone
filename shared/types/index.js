// ============================================================================
// TIPOS COMPARTIDOS - Frontend y Backend
// ============================================================================
// ============================================================================
// J. ENUMS Y CONSTANTES
// ============================================================================
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "Administrador";
    UserRole["GUARD"] = "Guardia";
    UserRole["RECEPTIONIST"] = "Recepcionista";
    UserRole["MECHANIC"] = "Mec\u00E1nico";
    UserRole["WORKSHOP_MANAGER"] = "Jefe de Taller";
    UserRole["INVENTORY_MANAGER"] = "Encargado de Inventario";
})(UserRole || (UserRole = {}));
export var VehicleStatus;
(function (VehicleStatus) {
    VehicleStatus["ACTIVE"] = "active";
    VehicleStatus["IN_MAINTENANCE"] = "in_maintenance";
    VehicleStatus["INACTIVE"] = "inactive";
})(VehicleStatus || (VehicleStatus = {}));
export var WorkOrderStatus;
(function (WorkOrderStatus) {
    WorkOrderStatus["PENDING"] = "pendiente";
    WorkOrderStatus["IN_PROGRESS"] = "en_progreso";
    WorkOrderStatus["PAUSED"] = "pausado";
    WorkOrderStatus["COMPLETED"] = "completado";
    WorkOrderStatus["CANCELLED"] = "cancelado";
})(WorkOrderStatus || (WorkOrderStatus = {}));
export var WorkOrderPriority;
(function (WorkOrderPriority) {
    WorkOrderPriority["LOW"] = "baja";
    WorkOrderPriority["MEDIUM"] = "media";
    WorkOrderPriority["HIGH"] = "alta";
    WorkOrderPriority["CRITICAL"] = "critica";
})(WorkOrderPriority || (WorkOrderPriority = {}));
//# sourceMappingURL=index.js.map