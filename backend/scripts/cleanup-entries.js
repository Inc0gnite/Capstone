const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupIncompleteEntries() {
  try {
    console.log('🔍 Buscando registros problemáticos...')
    
    // Buscar ingresos que podrían ser problemáticos
    const problematicEntries = await prisma.vehicleEntry.findMany({
      where: {
        status: 'ingresado',
        exitDate: null,
        OR: [
          // Sin órdenes de trabajo
          {
            workOrders: {
              none: {}
            }
          },
          // Sin fotos
          {
            photos: {
              none: {}
            }
          },
          // Sin control de llaves
          {
            keyControl: null
          },
          // Código de ingreso inválido
          {
            entryCode: {
              contains: 'N/A'
            }
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

    console.log(`📊 Encontrados ${problematicEntries.length} registros problemáticos:`)
    
    problematicEntries.forEach((entry, index) => {
      console.log(`\n${index + 1}. ${entry.entryCode}`)
      console.log(`   Conductor: ${entry.driverName}`)
      console.log(`   Fecha: ${entry.entryDate.toLocaleDateString('es-CL')}`)
      console.log(`   Órdenes: ${entry.workOrders.length}`)
      console.log(`   Fotos: ${entry.photos.length}`)
      console.log(`   Control llaves: ${entry.keyControl ? 'Sí' : 'No'}`)
    })

    if (problematicEntries.length === 0) {
      console.log('✅ No se encontraron registros problemáticos')
      return
    }

    console.log('\n⚠️  ADVERTENCIA: Se eliminarán los registros problemáticos.')
    console.log('   Asegúrate de hacer un backup antes de continuar.')
    
    // Eliminar registros problemáticos
    for (const entry of problematicEntries) {
      try {
        console.log(`\n🗑️  Eliminando ${entry.entryCode}...`)
        
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
        
        console.log(`   ✅ ${entry.entryCode} eliminado exitosamente`)
      } catch (error) {
        console.log(`   ❌ Error eliminando ${entry.entryCode}: ${error.message}`)
      }
    }

    console.log('\n✅ Limpieza completada')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la limpieza
cleanupIncompleteEntries()









