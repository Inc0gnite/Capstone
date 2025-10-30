const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function safeCleanup() {
  try {
    console.log('🔍 Iniciando limpieza segura de registros problemáticos...\n')
    
    // Buscar registros problemáticos
    const problematicEntries = await prisma.vehicleEntry.findMany({
      where: {
        status: 'ingresado',
        exitDate: null,
        // Criterios para identificar registros problemáticos
        OR: [
          // Sin órdenes de trabajo Y sin fotos
          {
            AND: [
              { workOrders: { none: {} } },
              { photos: { none: {} } }
            ]
          },
          // Sin control de llaves Y código inválido
          {
            AND: [
              { keyControl: null },
              { 
                OR: [
                  { entryCode: { contains: 'N/A' } },
                  { entryCode: { equals: '' } }
                ]
              }
            ]
          },
          // Ingresos muy antiguos sin actividad
          {
            AND: [
              { entryDate: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
              { workOrders: { none: {} } }
            ]
          }
        ]
      },
      include: {
        workOrders: true,
        photos: true,
        keyControl: true,
        vehicle: true
      }
    })

    console.log(`📊 Encontrados ${problematicEntries.length} registros problemáticos\n`)

    if (problematicEntries.length === 0) {
      console.log('✅ No se encontraron registros problemáticos para limpiar')
      return
    }

    // Mostrar detalles de cada registro
    console.log('📋 Registros a eliminar:')
    problematicEntries.forEach((entry, index) => {
      const entryAge = Math.floor((Date.now() - entry.entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log(`\n${index + 1}. ${entry.entryCode}`)
      console.log(`   Conductor: ${entry.driverName}`)
      console.log(`   Fecha: ${entry.entryDate.toLocaleDateString('es-CL')}`)
      console.log(`   Antigüedad: ${entryAge} días`)
      console.log(`   Órdenes: ${entry.workOrders.length}`)
      console.log(`   Fotos: ${entry.photos.length}`)
      console.log(`   Control llaves: ${entry.keyControl ? 'Sí' : 'No'}`)
      console.log(`   Vehículo: ${entry.vehicle ? 'Existe' : 'No existe'}`)
    })

    console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará permanentemente los registros.')
    console.log('   Asegúrate de hacer un backup de la base de datos antes de continuar.')
    
    // Simular eliminación (cambiar a false para ejecutar realmente)
    const DRY_RUN = true
    
    if (DRY_RUN) {
      console.log('\n🔍 MODO SIMULACIÓN - No se eliminarán registros realmente')
      console.log('   Para ejecutar la limpieza real, cambia DRY_RUN a false en el script')
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
safeCleanup()









