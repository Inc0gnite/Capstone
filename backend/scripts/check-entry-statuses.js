import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkEntryStatuses() {
  try {
    console.log('🔍 Verificando estados de ingresos en la base de datos...')

    const entries = await prisma.vehicleEntry.findMany({
      select: {
        id: true,
        entryCode: true,
        status: true,
        vehicle: {
          select: {
            licensePlate: true
          }
        },
        driverName: true
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📊 Total de ingresos encontrados: ${entries.length}`)
    console.log('\n📋 Estados únicos encontrados:')

    const uniqueStatuses = [...new Set(entries.map(entry => entry.status))]
    uniqueStatuses.forEach(status => {
      const count = entries.filter(entry => entry.status === status).length
      console.log(`   ${status}: ${count} ingresos`)
    })

    console.log('\n📋 Detalles por estado:')
    uniqueStatuses.forEach(status => {
      console.log(`\n🔸 Estado: ${status}`)
      const entriesWithStatus = entries.filter(entry => entry.status === status)
      entriesWithStatus.forEach(entry => {
        console.log(`   - ${entry.vehicle.licensePlate} - ${entry.driverName} (${entry.entryCode})`)
      })
    })

    console.log('\n✅ Verificación completada')

  } catch (error) {
    console.error('❌ Error verificando estados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEntryStatuses()


