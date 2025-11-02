const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function identifyProblematicEntries() {
  try {
    console.log('🔍 Analizando registros de vehículos ingresados...\n')
    
    // Obtener estadísticas generales
    const totalEntries = await prisma.vehicleEntry.count()
    const activeEntries = await prisma.vehicleEntry.count({
      where: { status: 'ingresado', exitDate: null }
    })
    
    console.log('📊 Estadísticas generales:')
    console.log(`   Total de ingresos: ${totalEntries}`)
    console.log(`   Ingresos activos: ${activeEntries}`)
    
    // Buscar ingresos problemáticos
    const problematicEntries = await prisma.vehicleEntry.findMany({
      where: {
        status: 'ingresado',
        exitDate: null
      },
      include: {
        workOrders: true,
        photos: true,
        keyControl: true,
        vehicle: true
      }
    })

    console.log(`\n🔍 Analizando ${problematicEntries.length} ingresos activos...\n`)

    const issues = {
      noWorkOrders: [],
      noPhotos: [],
      noKeyControl: [],
      invalidEntryCode: [],
      oldEntries: [],
      noVehicle: []
    }

    problematicEntries.forEach(entry => {
      const entryAge = Math.floor((Date.now() - entry.entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // Sin órdenes de trabajo
      if (entry.workOrders.length === 0) {
        issues.noWorkOrders.push(entry)
      }
      
      // Sin fotos
      if (entry.photos.length === 0) {
        issues.noPhotos.push(entry)
      }
      
      // Sin control de llaves
      if (!entry.keyControl) {
        issues.noKeyControl.push(entry)
      }
      
      // Código de ingreso inválido
      if (!entry.entryCode || entry.entryCode.includes('N/A') || entry.entryCode.length < 10) {
        issues.invalidEntryCode.push(entry)
      }
      
      // Ingresos muy antiguos (más de 7 días)
      if (entryAge > 7) {
        issues.oldEntries.push(entry)
      }
      
      // Vehículo no existe
      if (!entry.vehicle) {
        issues.noVehicle.push(entry)
      }
    })

    // Mostrar resultados
    console.log('📋 Análisis de problemas:')
    console.log(`   Sin órdenes de trabajo: ${issues.noWorkOrders.length}`)
    console.log(`   Sin fotos: ${issues.noPhotos.length}`)
    console.log(`   Sin control de llaves: ${issues.noKeyControl.length}`)
    console.log(`   Código inválido: ${issues.invalidEntryCode.length}`)
    console.log(`   Muy antiguos (>7 días): ${issues.oldEntries.length}`)
    console.log(`   Sin vehículo: ${issues.noVehicle.length}`)

    // Identificar registros que deberían eliminarse
    const toDelete = []
    
    problematicEntries.forEach(entry => {
      let problems = 0
      const entryAge = Math.floor((Date.now() - entry.entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (entry.workOrders.length === 0) problems++
      if (entry.photos.length === 0) problems++
      if (!entry.keyControl) problems++
      if (!entry.entryCode || entry.entryCode.includes('N/A')) problems++
      if (!entry.vehicle) problems++
      if (entryAge > 7) problems++
      
      // Si tiene 3 o más problemas, es probable que sea un registro problemático
      if (problems >= 3) {
        toDelete.push({
          ...entry,
          problems,
          entryAge
        })
      }
    })

    console.log(`\n⚠️  Registros recomendados para eliminación: ${toDelete.length}`)
    
    if (toDelete.length > 0) {
      console.log('\n📋 Detalles de registros a eliminar:')
      toDelete.forEach((entry, index) => {
        console.log(`\n${index + 1}. ${entry.entryCode}`)
        console.log(`   Conductor: ${entry.driverName}`)
        console.log(`   Fecha: ${entry.entryDate.toLocaleDateString('es-CL')}`)
        console.log(`   Antigüedad: ${entry.entryAge} días`)
        console.log(`   Problemas: ${entry.problems}`)
        console.log(`   Órdenes: ${entry.workOrders.length}`)
        console.log(`   Fotos: ${entry.photos.length}`)
        console.log(`   Control llaves: ${entry.keyControl ? 'Sí' : 'No'}`)
      })
    }

    console.log('\n✅ Análisis completado')
    console.log('\n💡 Para eliminar estos registros, ejecuta el script de limpieza.')
    
  } catch (error) {
    console.error('❌ Error durante el análisis:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el análisis
identifyProblematicEntries()












