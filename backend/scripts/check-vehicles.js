import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkVehicles() {
  try {
    console.log('🔍 Verificando vehículos en la base de datos...')

    const vehicles = await prisma.vehicle.findMany({
      include: {
        region: true
      },
      orderBy: { licensePlate: 'asc' }
    })

    console.log(`📊 Total de vehículos encontrados: ${vehicles.length}`)
    console.log('\n📋 Detalles de los vehículos:')

    vehicles.forEach((vehicle, index) => {
      console.log(`\n${index + 1}. Vehículo:`)
      console.log(`   ID: ${vehicle.id}`)
      console.log(`   Patente: ${vehicle.licensePlate}`)
      console.log(`   Tipo: ${vehicle.vehicleType}`)
      console.log(`   Marca: ${vehicle.brand}`)
      console.log(`   Modelo: ${vehicle.model || 'N/A'}`)
      console.log(`   Año: ${vehicle.year}`)
      console.log(`   VIN: ${vehicle.vin || 'N/A'}`)
      console.log(`   Número de Flota: ${vehicle.fleetNumber || 'N/A'}`)
      console.log(`   Región: ${vehicle.region.code} - ${vehicle.region.name}`)
      console.log(`   Estado: ${vehicle.status}`)
      console.log(`   Creado: ${vehicle.createdAt}`)
    })

    if (vehicles.length === 0) {
      console.log('\n⚠️  No hay vehículos en la base de datos.')
      console.log('💡 Solución: Crear algunos vehículos de prueba')
    } else {
      console.log('\n✅ Vehículos encontrados')
      console.log('🎯 Patentes existentes:')
      vehicles.forEach(vehicle => {
        console.log(`   ${vehicle.licensePlate}`)
      })
    }

  } catch (error) {
    console.error('❌ Error verificando vehículos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkVehicles()


