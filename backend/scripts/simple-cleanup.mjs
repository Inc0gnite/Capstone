import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function simpleCleanup() {
  try {
    console.log('🔍 Buscando registros problemáticos...\n')
    
    // Obtener todos los ingresos activos
    const allEntries = await prisma.vehicleEntry.findMany({
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

    console.log(`📊 Total de ingresos activos: ${allEntries.length}\n`)

    // Identificar registros problemáticos manualmente
    const problematicEntries = []
    
    allEntries.forEach(entry => {
      const entryAge = Math.floor((Date.now() - entry.entryDate.getTime()) / (1000 * 60 * 60 * 24))
      let problems = 0
      const issues = []
      
      // Verificar problemas
      if (entry.workOrders.length === 0) {
        problems++
        issues.push('Sin órdenes de trabajo')
      }
      
      if (entry.photos.length === 0) {
        problems++
        issues.push('Sin fotos')
      }
      
      if (!entry.keyControl) {
        problems++
        issues.push('Sin control de llaves')
      }
      
      if (!entry.entryCode || entry.entryCode.includes('N/A') || entry.entryCode.length < 10) {
        problems++
        issues.push('Código inválido')
      }
      
      if (!entry.vehicle) {
        problems++
        issues.push('Sin vehículo')
      }
      
      if (entryAge > 30) {
        problems++
        issues.push('Muy antiguo')
      }
      
      // Si tiene 3 o más problemas, es problemático
      if (problems >= 3) {
        problematicEntries.push({
          ...entry,
          problems,
          issues,
          entryAge
        })
      }
    })

    console.log(`⚠️  Registros problemáticos encontrados: ${problematicEntries.length}\n`)

    if (problematicEntries.length === 0) {
      console.log('✅ No se encontraron registros problemáticos para limpiar')
      return
    }

    // Mostrar detalles
    console.log('📋 Registros problemáticos:')
    problematicEntries.forEach((entry, index) => {
      console.log(`\n${index + 1}. ${entry.entryCode}`)
      console.log(`   Conductor: ${entry.driverName}`)
      console.log(`   Fecha: ${entry.entryDate.toLocaleDateString('es-CL')}`)
      console.log(`   Antigüedad: ${entry.entryAge} días`)
      console.log(`   Problemas: ${entry.problems}`)
      console.log(`   Issues: ${entry.issues.join(', ')}`)
      console.log(`   Órdenes: ${entry.workOrders.length}`)
      console.log(`   Fotos: ${entry.photos.length}`)
      console.log(`   Control llaves: ${entry.keyControl ? 'Sí' : 'No'}`)
    })

    console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará permanentemente los registros.')
    console.log('   Asegúrate de hacer un backup de la base de datos antes de continuar.')
    
    // Por defecto, solo simular
    const DRY_RUN = true
    
    if (DRY_RUN) {
      console.log('\n🔍 MODO SIMULACIÓN - No se eliminarán registros realmente')
      console.log('   Para ejecutar la limpieza real, cambia DRY_RUN a false en el script')
      
      problematicEntries.forEach((entry, index) => {
        console.log(`\n[SIMULACIÓN] Se eliminaría: ${entry.entryCode} (${entry.issues.join(', ')})`)
      })
    } else {
      console.log('\n🗑️  Eliminando registros...')
      
      let deletedCount = 0
      let errorCount = 0
      
      for (const entry of problematicEntries) {
        try {
          await prisma.$transaction(async (tx) => {
            // Eliminar fotos
            await tx.vehicleEntryPhoto.deleteMany({
              where: { entryId: entry.id }
            })
            
            // Eliminar control de llaves
            await tx.keyControl.deleteMany({
              where: { entryId: entry.id }
            })
            
            // Eliminar órdenes de trabajo
            await tx.workOrder.deleteMany({
              where: { entryId: entry.id }
            })
            
            // Eliminar el ingreso
            await tx.vehicleEntry.delete({
              where: { id: entry.id }
            })
          })
          
          console.log(`   ✅ ${entry.entryCode} eliminado`)
          deletedCount++
        } catch (error) {
          console.log(`   ❌ Error eliminando ${entry.entryCode}: ${error.message}`)
          errorCount++
        }
      }
      
      console.log(`\n📊 Resumen de limpieza:`)
      console.log(`   Registros eliminados: ${deletedCount}`)
      console.log(`   Errores: ${errorCount}`)
    }

    console.log('\n✅ Proceso completado')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la limpieza
simpleCleanup()












