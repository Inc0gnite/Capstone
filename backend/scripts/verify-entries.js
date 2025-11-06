import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyEntries() {
  try {
    console.log('🔍 Verificando ingresos en la base de datos...')
    
    const entries = await prisma.vehicleEntry.findMany({
      orderBy: { entryDate: 'desc' },
      include: {
        vehicle: true,
        workshop: true
      }
    })
    
    console.log(`📊 Total de ingresos encontrados: ${entries.length}`)
    
    if (entries.length === 0) {
      console.log('\n⚠️  No hay ingresos en la base de datos.')
      console.log('💡 Solución: Crear algunos ingresos de prueba')
      return
    }
    
    console.log('\n📋 Detalles de los ingresos:')
    
    entries.forEach((entry, index) => {
      console.log(`\n${index + 1}. Ingreso:`)
      console.log(`   ID: ${entry.id}`)
      console.log(`   Código: ${entry.entryCode}`)
      console.log(`   Vehículo: ${entry.vehicle.licensePlate}`)
      console.log(`   Conductor: ${entry.driverName}`)
      console.log(`   Fecha Ingreso: ${entry.entryDate}`)
      console.log(`   Fecha Salida: ${entry.exitDate || 'Sin salida'}`)
      console.log(`   Estado: ${entry.status}`)
      console.log(`   Taller: ${entry.workshop.name}`)
    })
    
    // Estadísticas
    const today = new Date().toISOString().split('T')[0]
    const entriesToday = entries.filter(entry => 
      entry.entryDate.toISOString().split('T')[0] === today
    ).length
    
    const exitsToday = entries.filter(entry => 
      entry.exitDate && entry.exitDate.toISOString().split('T')[0] === today
    ).length
    
    const activeEntries = entries.filter(entry => !entry.exitDate).length
    
    console.log('\n📈 Estadísticas:')
    console.log(`   Total ingresos: ${entries.length}`)
    console.log(`   Ingresos hoy: ${entriesToday}`)
    console.log(`   Salidas hoy: ${exitsToday}`)
    console.log(`   Ingresos activos: ${activeEntries}`)
    
  } catch (error) {
    console.error('❌ Error verificando ingresos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyEntries()


