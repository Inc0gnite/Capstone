# 📊 Sistema de Limitación de Capacidad de Mecánicos

## 🎯 **Objetivo**

Implementar un sistema que limite la cantidad de órdenes de trabajo que puede tener asignadas un mecánico simultáneamente, mejorando la gestión de carga de trabajo y evitando la sobrecarga del personal técnico.

## 🔧 **Implementación**

### **Backend**

#### **1. Base de Datos**
- **Campo agregado**: `maxOrdersPerMechanic` en la tabla `workshops`
- **Valor por defecto**: 5 órdenes por mecánico
- **Configurable**: Cada taller puede tener su propio límite

```sql
ALTER TABLE workshops ADD COLUMN max_orders_per_mechanic INTEGER DEFAULT 5;
```

#### **2. Validación en Servicios**
- **WorkOrderService**: Valida capacidad antes de crear/asignar órdenes
- **Método**: `validateMechanicCapacity(mechanicId, workshopId)`
- **Estados considerados**: `pendiente`, `en_progreso`, `pausado`

#### **3. API Endpoints**
- **POST** `/api/work-orders/:id/assign` - Asignar mecánico con validación
- **GET** `/api/workshops/:id/mechanic-capacity` - Obtener capacidad de mecánicos
- **GET** `/api/mechanics/:id/can-assign` - Verificar si se puede asignar orden

### **Frontend**

#### **1. Componentes**
- **MechanicCapacityIndicator**: Muestra capacidad individual de un mecánico
- **MechanicCapacityList**: Lista de capacidad de todos los mecánicos
- **Integración**: Dashboard del Jefe de Taller

#### **2. Servicios**
- **mechanicCapacityService**: Gestiona consultas de capacidad
- **workOrderService**: Incluye método `assignMechanic` con validación

## 📋 **Funcionalidades**

### **Validación Automática**
- ✅ **Creación de órdenes**: Valida si el mecánico asignado puede recibir más órdenes
- ✅ **Asignación manual**: Valida antes de asignar mecánico a orden existente
- ✅ **Mensajes informativos**: Explica por qué no se puede asignar

### **Indicadores Visuales**
- ✅ **Barra de progreso**: Muestra carga actual vs límite máximo
- ✅ **Códigos de color**: Verde (<80%), Amarillo (80-99%), Rojo (100%)
- ✅ **Iconos**: ✅ Disponible, ⚠️ Cerca del límite, 🚫 Límite alcanzado

### **Configuración Flexible**
- ✅ **Por taller**: Cada taller puede configurar su límite
- ✅ **Valor por defecto**: 5 órdenes por mecánico
- ✅ **Actualizable**: Los administradores pueden modificar el límite

## 🚨 **Mensajes de Error**

### **Límite Alcanzado**
```
El mecánico Carlos Silva ya tiene 5 órdenes activas asignadas. 
El límite máximo es 5 órdenes por mecánico en el taller Taller Quilicura.
```

### **Validación en Asignación**
```
❌ Error: No se puede asignar mecánico
⚠️ El mecánico ya tiene el límite máximo de órdenes asignadas
```

## 📊 **Estados Considerados**

### **Órdenes Activas** (Cuentan para el límite)
- `pendiente` - Orden creada, esperando inicio
- `en_progreso` - Orden en ejecución
- `pausado` - Orden temporalmente detenida

### **Órdenes Inactivas** (No cuentan para el límite)
- `completado` - Orden finalizada
- `cancelado` - Orden cancelada

## 🔄 **Flujo de Trabajo**

1. **Jefe de Taller** intenta asignar orden a mecánico
2. **Sistema** verifica órdenes activas del mecánico
3. **Si está bajo el límite**: Asignación exitosa
4. **Si alcanzó el límite**: Error con mensaje explicativo
5. **Dashboard** muestra indicadores de capacidad en tiempo real

## 🎨 **Interfaz de Usuario**

### **Dashboard del Jefe de Taller**
```
┌─────────────────────────────────────────────────────────┐
│ Capacidad de Mecánicos                                  │
├─────────────────────────────────────────────────────────┤
│ ✅ Carlos Silva     ████████░░ 3/5                      │
│ ⚠️ Ana Martínez     ██████████ 4/5  Cerca del límite    │
│ 🚫 Pedro López      ██████████ 5/5  Límite alcanzado    │
│ ✅ María González   ██████░░░░ 2/5                      │
└─────────────────────────────────────────────────────────┘
```

## 🔧 **Configuración**

### **Modificar Límite por Taller**
```sql
UPDATE workshops 
SET max_orders_per_mechanic = 7 
WHERE id = 'taller-id';
```

### **Valores Recomendados**
- **Taller pequeño** (≤10 mecánicos): 5 órdenes
- **Taller mediano** (11-20 mecánicos): 6 órdenes  
- **Taller grande** (>20 mecánicos): 7 órdenes

## 📈 **Beneficios**

1. **Gestión de Carga**: Evita sobrecargar mecánicos
2. **Calidad del Trabajo**: Mejora la atención a cada orden
3. **Planificación**: Facilita la distribución de trabajo
4. **Transparencia**: Visibilidad clara de la capacidad del equipo
5. **Flexibilidad**: Configuración adaptable por taller

## 🚀 **Próximas Mejoras**

- [ ] **Notificaciones**: Alertas cuando mecánicos están cerca del límite
- [ ] **Reasignación automática**: Sugerir mecánicos disponibles
- [ ] **Métricas**: Reportes de utilización de capacidad
- [ ] **Configuración dinámica**: Cambiar límites sin reiniciar sistema

