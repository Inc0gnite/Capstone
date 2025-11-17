import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testAPI() {
  try {
    console.log('🔍 Probando API de ingresos...')
    
    // Simular la consulta que hace el frontend
    const activeEntries = await prisma.vehicleEntry.findMany({
      where: {
        exitDate: null
      },
      include: {
        vehicle: true,
        workshop: true
      }
    })
    
    const allEntries = await prisma.vehicleEntry.findMany({
      take: 1000,
      include: {
        vehicle: true,
        workshop: true
      }
    })
    
    console.log('📊 Resultados de la consulta:')
    console.log(`   Ingresos activos: ${activeEntries.length}`)
    console.log(`   Total ingresos: ${allEntries.length}`)
    
    // Calcular estadísticas como lo hace el frontend
    const today = new Date().toISOString().split('T')[0]
    const entriesToday = allEntries.filter(entry => 
      entry.entryDate.toISOString().split('T')[0] === today
    ).length
    
    const exitsToday = allEntries.filter(entry => 
      entry.exitDate && entry.exitDate.toISOString().split('T')[0] === today
    ).length
    
    console.log('\n📈 Estadísticas calculadas:')
    console.log(`   Vehículos en taller: ${activeEntries.length}`)
    console.log(`   Ingresos hoy: ${entriesToday}`)
    console.log(`   Salidas hoy: ${exitsToday}`)
    console.log(`   Total ingresos: ${allEntries.length}`)
    
    // Verificar datos específicos
    console.log('\n🔍 Verificación de datos:')
    console.log('   Fecha de hoy:', today)
    console.log('   Ingresos activos:')
    activeEntries.forEach((entry, index) => {
      console.log(`     ${index + 1}. ${entry.vehicle.licensePlate} - ${entry.driverName} (${entry.entryDate.toISOString().split('T')[0]})`)
    })
    
    console.log('\n   Ingresos de hoy:')
    allEntries.filter(entry => 
      entry.entryDate.toISOString().split('T')[0] === today
    ).forEach((entry, index) => {
      console.log(`     ${index + 1}. ${entry.vehicle.licensePlate} - ${entry.driverName}`)
    })
    
  } catch (error) {
    console.error('❌ Error en la consulta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()


