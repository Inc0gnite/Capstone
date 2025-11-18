import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar base de datos (opcional, comentar en producción)
  console.log('🗑️  Limpiando base de datos...')
  await prisma.auditLog.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.document.deleteMany()
  await prisma.sparePartMovement.deleteMany()
  await prisma.workOrderSparePart.deleteMany()
  await prisma.sparePart.deleteMany()
  await prisma.workPause.deleteMany()
  await prisma.workOrderPhoto.deleteMany()
  await prisma.workOrderStatus.deleteMany()
  await prisma.workOrder.deleteMany()
  await prisma.keyControl.deleteMany()
  await prisma.vehicleEntry.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.workshopSchedule.deleteMany()
  await prisma.user.deleteMany()
  await prisma.workshop.deleteMany()
  await prisma.region.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.role.deleteMany()

  // ============================================================================
  // 1. ROLES Y PERMISOS
  // ============================================================================
  console.log('👥 Creando roles y permisos...')

  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: 'Administrador',
        description: 'Acceso total al sistema',
      },
    }),
    prisma.role.create({
      data: {
        name: 'Guardia',
        description: 'Control de acceso vehicular',
      },
    }),
    prisma.role.create({
      data: {
        name: 'Recepcionista',
        description: 'Gestión de ingresos y órdenes',
      },
    }),
    prisma.role.create({
      data: {
        name: 'Mecánico',
        description: 'Ejecución de trabajos',
      },
    }),
    prisma.role.create({
      data: {
        name: 'Jefe de Taller',
        description: 'Supervisión del taller',
      },
    }),
    prisma.role.create({
      data: {
        name: 'Encargado de Inventario',
        description: 'Gestión de repuestos',
      },
    }),
  ])

  const permissions = await Promise.all([
    // Dashboard
    prisma.permission.create({
      data: { resource: 'dashboard', action: 'read', description: 'Ver dashboard' },
    }),

    // Usuarios
    prisma.permission.create({
      data: { resource: 'users', action: 'read', description: 'Ver usuarios' },
    }),
    prisma.permission.create({
      data: { resource: 'users', action: 'create', description: 'Crear usuarios' },
    }),
    prisma.permission.create({
      data: { resource: 'users', action: 'update', description: 'Actualizar usuarios' },
    }),
    prisma.permission.create({
      data: { resource: 'users', action: 'delete', description: 'Eliminar usuarios' },
    }),

    // Vehículos
    prisma.permission.create({
      data: { resource: 'vehicles', action: 'read', description: 'Ver vehículos' },
    }),
    prisma.permission.create({
      data: { resource: 'vehicles', action: 'create', description: 'Crear vehículos' },
    }),
    prisma.permission.create({
      data: { resource: 'vehicles', action: 'update', description: 'Actualizar vehículos' },
    }),
    prisma.permission.create({
      data: { resource: 'vehicles', action: 'delete', description: 'Eliminar vehículos' },
    }),

    // Ingresos
    prisma.permission.create({
      data: {
        resource: 'vehicle-entries',
        action: 'read',
        description: 'Ver ingresos',
      },
    }),
    prisma.permission.create({
      data: {
        resource: 'vehicle-entries',
        action: 'create',
        description: 'Crear ingresos',
      },
    }),
    prisma.permission.create({
      data: {
        resource: 'vehicle-entries',
        action: 'update',
        description: 'Actualizar ingresos',
      },
    }),

    // Órdenes de trabajo
    prisma.permission.create({
      data: {
        resource: 'work-orders',
        action: 'read',
        description: 'Ver órdenes',
      },
    }),
    prisma.permission.create({
      data: {
        resource: 'work-orders',
        action: 'create',
        description: 'Crear órdenes',
      },
    }),
    prisma.permission.create({
      data: {
        resource: 'work-orders',
        action: 'update',
        description: 'Actualizar órdenes',
      },
    }),

    // Repuestos
    prisma.permission.create({
      data: {
        resource: 'spare-parts',
        action: 'read',
        description: 'Ver repuestos',
      },
    }),
    prisma.permission.create({
      data: {
        resource: 'spare-parts',
        action: 'create',
        description: 'Crear repuestos',
      },
    }),
    prisma.permission.create({
      data: {
        resource: 'spare-parts',
        action: 'update',
        description: 'Actualizar repuestos',
      },
    }),

    // Talleres y regiones
    prisma.permission.create({
      data: { resource: 'workshops', action: 'read', description: 'Ver talleres' },
    }),
    prisma.permission.create({
      data: { resource: 'regions', action: 'read', description: 'Ver regiones' },
    }),

    // Reportes
    prisma.permission.create({
      data: { resource: 'reports', action: 'read', description: 'Ver y generar reportes' },
    }),
  ])

  // Asignar todos los permisos al rol Admin
  await Promise.all(
    permissions.map((permission) =>
      prisma.rolePermission.create({
        data: {
          roleId: roles[0].id, // Administrador
          permissionId: permission.id,
        },
      })
    )
  )

  // Asignar permisos específicos a otros roles
  // Guardia: ver vehículos e ingresos, crear ingresos
  await Promise.all([
    prisma.rolePermission.create({
      data: {
        roleId: roles[1].id,
        permissionId: permissions[0].id, // dashboard
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[1].id,
        permissionId: permissions[5].id, // vehicles:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[1].id,
        permissionId: permissions[6].id, // vehicles:create
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[1].id,
        permissionId: permissions[9].id, // vehicle-entries:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[1].id,
        permissionId: permissions[10].id, // vehicle-entries:create
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[1].id,
        permissionId: permissions[11].id, // vehicle-entries:update
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[1].id,
        permissionId: permissions[19].id, // regions:read
      },
    }),
  ])

  // Recepcionista: ver vehículos, ingresos, órdenes de trabajo, dashboard
  await Promise.all([
    prisma.rolePermission.create({
      data: {
        roleId: roles[2].id, // Recepcionista
        permissionId: permissions[0].id, // dashboard:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[2].id, // Recepcionista
        permissionId: permissions[5].id, // vehicles:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[2].id, // Recepcionista
        permissionId: permissions[9].id, // vehicle-entries:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[2].id, // Recepcionista
        permissionId: permissions[10].id, // vehicle-entries:create
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[2].id, // Recepcionista
        permissionId: permissions[11].id, // vehicle-entries:update
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[2].id, // Recepcionista
        permissionId: permissions[12].id, // work-orders:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[2].id, // Recepcionista
        permissionId: permissions[13].id, // work-orders:create
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[2].id, // Recepcionista
        permissionId: permissions[14].id, // work-orders:update
      },
    }),
  ])

  // Mecánico: ver dashboard, órdenes de trabajo (propias), repuestos, ingresos (para ver fotos y documentos)
  await Promise.all([
    prisma.rolePermission.create({
      data: {
        roleId: roles[3].id, // Mecánico
        permissionId: permissions[0].id, // dashboard:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[3].id, // Mecánico
        permissionId: permissions[9].id, // vehicle-entries:read (para ver fotos y documentos de órdenes)
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[3].id, // Mecánico
        permissionId: permissions[12].id, // work-orders:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[3].id, // Mecánico
        permissionId: permissions[14].id, // work-orders:update
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[3].id, // Mecánico
        permissionId: permissions[15].id, // spare-parts:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[3].id, // Mecánico
        permissionId: permissions[17].id, // spare-parts:update (para solicitar repuestos)
      },
    }),
  ])

  // Jefe de Taller: Dashboard, órdenes de trabajo completas, vehículos, repuestos (gestionar inventario)
  await Promise.all([
    prisma.rolePermission.create({
      data: {
        roleId: roles[4].id, // Jefe de Taller
        permissionId: permissions[0].id, // dashboard:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[4].id, // Jefe de Taller
        permissionId: permissions[5].id, // vehicles:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[4].id, // Jefe de Taller
        permissionId: permissions[9].id, // vehicle-entries:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[4].id, // Jefe de Taller
        permissionId: permissions[12].id, // work-orders:read (solo lectura - ver detalles)
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[4].id, // Jefe de Taller
        permissionId: permissions[15].id, // spare-parts:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[4].id, // Jefe de Taller
        permissionId: permissions[16].id, // spare-parts:create
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[4].id, // Jefe de Taller
        permissionId: permissions[17].id, // spare-parts:update
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[4].id, // Jefe de Taller
        permissionId: permissions[18].id, // workshops:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[4].id, // Jefe de Taller
        permissionId: permissions[19].id, // regions:read
      },
    }),
    prisma.rolePermission.create({
      data: {
        roleId: roles[4].id, // Jefe de Taller
        permissionId: permissions[20].id, // reports:read
      },
    }),
  ])

  console.log(`✅ Creados ${roles.length} roles y ${permissions.length} permisos`)

  // ============================================================================
  // 2. REGIONES Y TALLERES
  // ============================================================================
  console.log('🏭 Creando regiones y talleres...')

  const regions = await Promise.all([
    prisma.region.create({ data: { code: 'RM', name: 'Región Metropolitana' } }),
    prisma.region.create({ data: { code: 'V', name: 'Región de Valparaíso' } }),
    prisma.region.create({ data: { code: 'VIII', name: 'Región del Biobío' } }),
  ])

  const workshops = await Promise.all([
    prisma.workshop.create({
      data: {
        code: 'TAL-RM-01',
        name: 'Taller Quilicura',
        regionId: regions[0].id,
        address: 'Av. Los Pajaritos 1234',
        city: 'Quilicura',
        phone: '+56223456789',
        capacity: 20,
        maxOrdersPerMechanic: 4, // Límite base de órdenes (ahora basado en horas)
      },
    }),
    prisma.workshop.create({
      data: {
        code: 'TAL-RM-02',
        name: 'Taller Maipú',
        regionId: regions[0].id,
        address: 'Camino a Melipilla 5678',
        city: 'Maipú',
        phone: '+56223456790',
        capacity: 15,
        maxOrdersPerMechanic: 4, // Límite base de órdenes (ahora basado en horas)
      },
    }),
    prisma.workshop.create({
      data: {
        code: 'TAL-V-01',
        name: 'Taller Valparaíso',
        regionId: regions[1].id,
        address: 'Av. Argentina 9876',
        city: 'Valparaíso',
        phone: '+56322345678',
        capacity: 10,
        maxOrdersPerMechanic: 4, // Límite base de órdenes (ahora basado en horas)
      },
    }),
  ])

  // Horarios para talleres (Lunes a Viernes)
  for (const workshop of workshops.slice(0, 2)) {
    for (let day = 1; day <= 5; day++) {
      await prisma.workshopSchedule.create({
        data: {
          workshopId: workshop.id,
          dayOfWeek: day,
          openTime: '08:00',
          closeTime: '18:00',
        },
      })
    }
  }

  console.log(`✅ Creadas ${regions.length} regiones y ${workshops.length} talleres`)

  // ============================================================================
  // 3. USUARIOS
  // ============================================================================
  console.log('👤 Creando usuarios...')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const users = await Promise.all([
    prisma.user.create({
      data: {
        rut: '12.345.678-9',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'admin@pepsico.cl',
        password: hashedPassword,
        phone: '+56912345678',
        roleId: roles[0].id, // Admin
      },
    }),
    prisma.user.create({
      data: {
        rut: '23.456.789-0',
        firstName: 'María',
        lastName: 'González',
        email: 'guardia@pepsico.cl',
        password: hashedPassword,
        phone: '+56987654321',
        roleId: roles[1].id, // Guardia
        workshopId: workshops[0].id,
      },
    }),
    prisma.user.create({
      data: {
        rut: '34.567.890-1',
        firstName: 'Pedro',
        lastName: 'Rodríguez',
        email: 'recepcion@pepsico.cl',
        password: hashedPassword,
        phone: '+56911111111',
        roleId: roles[2].id, // Recepcionista
        workshopId: workshops[0].id,
      },
    }),
    prisma.user.create({
      data: {
        rut: '45.678.901-2',
        firstName: 'Carlos',
        lastName: 'Silva',
        email: 'mecanico1@pepsico.cl',
        password: hashedPassword,
        phone: '+56922222222',
        roleId: roles[3].id, // Mecánico
        workshopId: workshops[0].id,
      },
    }),
    prisma.user.create({
      data: {
        rut: '56.789.012-3',
        firstName: 'Ana',
        lastName: 'Martínez',
        email: 'mecanico2@pepsico.cl',
        password: hashedPassword,
        phone: '+56933333333',
        roleId: roles[3].id, // Mecánico
        workshopId: workshops[0].id,
      },
    }),
    prisma.user.create({
      data: {
        rut: '67.890.123-4',
        firstName: 'Luis',
        lastName: 'López',
        email: 'jefe@pepsico.cl',
        password: hashedPassword,
        phone: '+56944444444',
        roleId: roles[4].id, // Jefe de Taller
        workshopId: workshops[0].id,
      },
    }),
    prisma.user.create({
      data: {
        rut: '78.901.234-5',
        firstName: 'Roberto',
        lastName: 'Fernández',
        email: 'inventario@pepsico.cl',
        password: hashedPassword,
        phone: '+56955555555',
        roleId: roles[5].id, // Encargado de Inventario
        workshopId: workshops[0].id,
      },
    }),
  ])

  console.log(`✅ Creados ${users.length} usuarios`)

  // ============================================================================
  // 4. VEHÍCULOS
  // ============================================================================
  console.log('🚚 Creando vehículos...')

  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        licensePlate: 'ABCD12',
        vehicleType: 'Camión',
        brand: 'Mercedes-Benz',
        model: 'Actros 2644',
        year: 2020,
        vin: 'WDB9632401L123456',
        fleetNumber: 'FL-001',
        regionId: regions[0].id,
        status: 'active',
      },
    }),
    prisma.vehicle.create({
      data: {
        licensePlate: 'EFGH34',
        vehicleType: 'Camioneta',
        brand: 'Toyota',
        model: 'Hilux',
        year: 2021,
        vin: 'JTEBU4BF0BK123456',
        fleetNumber: 'FL-002',
        regionId: regions[0].id,
        status: 'active',
      },
    }),
    prisma.vehicle.create({
      data: {
        licensePlate: 'IJKL56',
        vehicleType: 'Camión',
        brand: 'Volvo',
        model: 'FH16',
        year: 2019,
        fleetNumber: 'FL-003',
        regionId: regions[1].id,
        status: 'active',
      },
    }),
    prisma.vehicle.create({
      data: {
        licensePlate: 'MNOP78',
        vehicleType: 'Furgón',
        brand: 'Ford',
        model: 'Transit',
        year: 2022,
        fleetNumber: 'FL-004',
        regionId: regions[0].id,
        status: 'in_maintenance',
      },
    }),
  ])

  console.log(`✅ Creados ${vehicles.length} vehículos`)

  // ============================================================================
  // 5. REPUESTOS
  // ============================================================================
  console.log('🔧 Creando repuestos...')

  const spareParts = await Promise.all([
    prisma.sparePart.create({
      data: {
        code: 'REP-001',
        name: 'Filtro de Aceite',
        description: 'Filtro de aceite universal',
        category: 'Filtros',
        unitOfMeasure: 'unidad',
        unitPrice: 15000,
        currentStock: 50,
        minStock: 10,
        maxStock: 100,
        location: 'Estante A1',
      },
    }),
    prisma.sparePart.create({
      data: {
        code: 'REP-002',
        name: 'Pastillas de Freno',
        description: 'Juego de pastillas delanteras',
        category: 'Frenos',
        unitOfMeasure: 'juego',
        unitPrice: 45000,
        currentStock: 25,
        minStock: 5,
        maxStock: 50,
        location: 'Estante B2',
      },
    }),
    prisma.sparePart.create({
      data: {
        code: 'REP-003',
        name: 'Aceite Motor 15W40',
        description: 'Aceite sintético para motor diesel',
        category: 'Lubricantes',
        unitOfMeasure: 'litro',
        unitPrice: 8000,
        currentStock: 200,
        minStock: 50,
        maxStock: 500,
        location: 'Bodega C',
      },
    }),
    prisma.sparePart.create({
      data: {
        code: 'REP-004',
        name: 'Batería 12V',
        description: 'Batería 12V 100Ah',
        category: 'Eléctrico',
        unitOfMeasure: 'unidad',
        unitPrice: 120000,
        currentStock: 8,
        minStock: 5,
        maxStock: 20,
        location: 'Estante D1',
      },
    }),
    prisma.sparePart.create({
      data: {
        code: 'REP-005',
        name: 'Neumático 295/80R22.5',
        description: 'Neumático para camión',
        category: 'Neumáticos',
        unitOfMeasure: 'unidad',
        unitPrice: 180000,
        currentStock: 3,
        minStock: 8,
        maxStock: 30,
        location: 'Bodega Neumáticos',
      },
    }),
  ])

  // Crear movimientos iniciales de stock
  for (const part of spareParts) {
    await prisma.sparePartMovement.create({
      data: {
        sparePartId: part.id,
        movementType: 'entrada',
        quantity: part.currentStock,
        previousStock: 0,
        newStock: part.currentStock,
        reason: 'Stock inicial',
      },
    })
  }

  console.log(`✅ Creados ${spareParts.length} repuestos`)

  // ============================================================================
  // 6. INGRESOS DE VEHÍCULOS
  // ============================================================================
  console.log('📝 Creando ingresos de vehículos...')

  const entries = await Promise.all([
    prisma.vehicleEntry.create({
      data: {
        entryCode: 'ING-20250115-0001',
        vehicleId: vehicles[3].id,
        workshopId: workshops[0].id,
        driverRut: '11.111.111-1',
        driverName: 'Roberto Gómez',
        driverPhone: '+56955555555',
        entryDate: new Date(),
        entryKm: 85000,
        fuelLevel: '3/4',
        hasKeys: true,
        observations: 'Vehículo con ruido en el motor',
        status: 'ingresado',
        createdById: users[1].id, // Guardia
      },
    }),
  ])

  // Crear control de llaves
  await prisma.keyControl.create({
    data: {
      entryId: entries[0].id,
      keyLocation: 'Casillero 15',
    },
  })

  console.log(`✅ Creados ${entries.length} ingresos`)

  // ============================================================================
  // 7. ÓRDENES DE TRABAJO
  // ============================================================================
  console.log('🔨 Creando órdenes de trabajo...')

  const workOrder = await prisma.workOrder.create({
    data: {
      orderNumber: 'OT-20250115-0001',
      vehicleId: vehicles[3].id,
      entryId: entries[0].id,
      workshopId: workshops[0].id,
      workType: 'Mantenimiento Preventivo',
      priority: 'media',
      description: 'Cambio de aceite, filtros y revisión general',
      estimatedHours: 4,
      assignedToId: users[3].id, // Mecánico 1
      currentStatus: 'en_progreso',
      startedAt: new Date(),
      createdById: users[2].id, // Recepcionista
    },
  })

  // Crear historial de estados
  await Promise.all([
    prisma.workOrderStatus.create({
      data: {
        workOrderId: workOrder.id,
        status: 'pendiente',
        observations: 'Orden creada',
        changedById: users[2].id,
        changedAt: new Date(Date.now() - 3600000), // 1 hora atrás
      },
    }),
    prisma.workOrderStatus.create({
      data: {
        workOrderId: workOrder.id,
        status: 'en_progreso',
        observations: 'Iniciando trabajos',
        changedById: users[3].id,
      },
    }),
  ])

  // Solicitar repuestos para la orden
  await prisma.workOrderSparePart.create({
    data: {
      workOrderId: workOrder.id,
      sparePartId: spareParts[0].id, // Filtro de aceite
      quantityRequested: 1,
      quantityDelivered: 1,
      status: 'entregado',
      deliveredAt: new Date(),
    },
  })

  console.log(`✅ Creada 1 orden de trabajo`)

  // ============================================================================
  // 8. NOTIFICACIONES
  // ============================================================================
  console.log('🔔 Creando notificaciones...')

  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[3].id,
        title: 'Nueva orden asignada',
        message: `Se le ha asignado la orden ${workOrder.orderNumber}`,
        type: 'work_order_assigned',
        relatedTo: 'work-orders',
        relatedId: workOrder.id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[5].id, // Jefe de taller
        title: 'Nuevo ingreso',
        message: `Vehículo ${vehicles[3].licensePlate} ingresado al taller`,
        type: 'vehicle_entry',
        relatedTo: 'vehicle-entries',
        relatedId: entries[0].id,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[5].id,
        title: 'Alerta de stock bajo',
        message: `El repuesto ${spareParts[4].name} tiene stock bajo`,
        type: 'low_stock',
        relatedTo: 'spare-parts',
        relatedId: spareParts[4].id,
        isRead: false,
      },
    }),
  ])

  console.log(`✅ Creadas 3 notificaciones`)

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📋 Resumen:')
  console.log(`   - ${roles.length} roles`)
  console.log(`   - ${permissions.length} permisos`)
  console.log(`   - ${regions.length} regiones`)
  console.log(`   - ${workshops.length} talleres`)
  console.log(`   - ${users.length} usuarios`)
  console.log(`   - ${vehicles.length} vehículos`)
  console.log(`   - ${spareParts.length} repuestos`)
  console.log(`   - ${entries.length} ingresos`)
  console.log(`   - 1 orden de trabajo`)
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
