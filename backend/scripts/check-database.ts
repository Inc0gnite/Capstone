import prisma from '../src/config/database'

async function checkDatabase() {
  try {
    console.log('📊 Verificando base de datos...\n')

    // Contar registros por tabla
    const counts = {
      users: await prisma.user.count(),
      roles: await prisma.role.count(),
      permissions: await prisma.permission.count(),
      vehicles: await prisma.vehicle.count(),
      vehicleEntries: await prisma.vehicleEntry.count(),
      workOrders: await prisma.workOrder.count(),
      spareParts: await prisma.sparePart.count(),
      workshops: await prisma.workshop.count(),
      regions: await prisma.region.count(),
      notifications: await prisma.notification.count(),
      auditLogs: await prisma.auditLog.count(),
    }

    console.log('📈 Total de registros por tabla:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    Object.entries(counts).forEach(([table, count]) => {
      console.log(`  ${table.padEnd(20)} : ${count}`)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Mostrar algunos datos de ejemplo
    console.log('👥 Usuarios (últimos 5):')
    const users = await prisma.user.findMany({
      take: 5,
      include: { role: true, workshop: true },
      orderBy: { createdAt: 'desc' },
    })
    users.forEach((u) => {
      console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) - Rol: ${u.role.name}`)
    })

    console.log('\n🚗 Vehículos (últimos 5):')
    const vehicles = await prisma.vehicle.findMany({
      take: 5,
      include: { region: true, workshop: true },
      orderBy: { createdAt: 'desc' },
    })
    vehicles.forEach((v) => {
      console.log(`  - ${v.licensePlate} (${v.type}) - Región: ${v.region?.name || 'N/A'}`)
    })

    console.log('\n📦 Repuestos (últimos 5):')
    const spareParts = await prisma.sparePart.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    })
    spareParts.forEach((sp) => {
      console.log(
        `  - ${sp.code}: ${sp.name} - Stock: ${sp.currentStock}/${sp.minStock}`
      )
    })

    console.log('\n🔧 Órdenes de Trabajo (últimas 5):')
    const workOrders = await prisma.workOrder.findMany({
      take: 5,
      include: { vehicle: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    })
    workOrders.forEach((wo) => {
      console.log(
        `  - ${wo.workOrderNumber} - Vehículo: ${wo.vehicle.licensePlate} - Estado: ${wo.status}`
      )
    })

    console.log('\n✅ Verificación completada')
  } catch (error) {
    console.error('❌ Error al verificar base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()

